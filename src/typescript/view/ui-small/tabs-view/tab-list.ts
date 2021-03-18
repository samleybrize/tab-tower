import { EventBus } from '../../../bus/event-bus';
import { OpenedTabAudibleStateUpdated } from '../../../tab/opened-tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../../../tab/opened-tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabDiscardStateUpdated } from '../../../tab/opened-tab/event/opened-tab-discard-state-updated';
import { OpenedTabFaviconUrlUpdated } from '../../../tab/opened-tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../../../tab/opened-tab/event/opened-tab-focused';
import { OpenedTabIsLoading } from '../../../tab/opened-tab/event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from '../../../tab/opened-tab/event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from '../../../tab/opened-tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../../../tab/opened-tab/event/opened-tab-pin-state-updated';
import { OpenedTabPositionUpdated } from '../../../tab/opened-tab/event/opened-tab-position-updated';
import { OpenedTabTitleUpdated } from '../../../tab/opened-tab/event/opened-tab-title-updated';
import { OpenedTabUnfocused } from '../../../tab/opened-tab/event/opened-tab-unfocused';
import { OpenedTabUrlUpdated } from '../../../tab/opened-tab/event/opened-tab-url-updated';
import { OpenedTab } from '../../../tab/opened-tab/opened-tab';
import { PerGroupTaskScheduler } from '../../../utils/per-group-task-scheduler';
import { ScrollManipulator } from '../../utils/scroll-manipulator';
import { Tab, TabFactory } from './tab';

export type NumberOfSelectedTabsChangeObserver = (tabListId: string) => void;

export class TabList {
    private tabMap = new Map<string, Tab>();
    private subContainerElement: HTMLElement;
    private noTabMatchesSearchElement: HTMLElement;
    private lastSelectorClicked: Tab = null;
    private numberOfSelectedTabsChangeObserverList: NumberOfSelectedTabsChangeObserver[] = [];

    constructor(
        public readonly tabListId: string,
        public readonly containerElement: HTMLElement,
        eventBus: EventBus,
        private tabFactory: TabFactory,
        private scrollManipulator: ScrollManipulator,
        private taskScheduler: PerGroupTaskScheduler,
    ) {
        eventBus.subscribe(OpenedTabIsLoading, this.onTabLoading, this);
        eventBus.subscribe(OpenedTabLoadingIsComplete, this.onTabLoadingComplete, this);
        eventBus.subscribe(OpenedTabAudibleStateUpdated, this.onTabAudibleStateUpdate, this);
        eventBus.subscribe(OpenedTabAudioMuteStateUpdated, this.onTabAudioMuteStateUpdate, this);
        eventBus.subscribe(OpenedTabDiscardStateUpdated, this.onTabDiscardStateUpdate, this);
        eventBus.subscribe(OpenedTabFaviconUrlUpdated, this.onTabFaviconUrlUpdate, this);
        eventBus.subscribe(OpenedTabFocused, this.onTabFocus, this);
        eventBus.subscribe(OpenedTabMoved, this.onTabMove, this);
        eventBus.subscribe(OpenedTabPinStateUpdated, this.onTabPinStateUpdate, this);
        eventBus.subscribe(OpenedTabPositionUpdated, this.onTabPositionUpdate, this);
        eventBus.subscribe(OpenedTabTitleUpdated, this.onTabTitleUpdate, this);
        eventBus.subscribe(OpenedTabUnfocused, this.onTabUnfocus, this);
        eventBus.subscribe(OpenedTabUrlUpdated, this.onTabUrlUpdate, this);
    }

    async init(openTabList: OpenedTab[]) {
        await this.taskScheduler.add('init', async () => {
            this.subContainerElement = document.createElement('div');
            this.subContainerElement.classList.add('tabs-container');
            this.containerElement.insertAdjacentElement('afterbegin', this.subContainerElement);
            const tabPlaceholder = this.containerElement.querySelector('.tab-placeholder');

            if (tabPlaceholder) {
                this.subContainerElement.insertAdjacentElement('beforeend', tabPlaceholder);
            }

            this.noTabMatchesSearchElement = this.createNoTabMatchesSearchElement();
            this.subContainerElement.appendChild(this.noTabMatchesSearchElement);
            let focusedTab: Tab;

            for (const openedTab of openTabList) {
                const tab = this.createTab(openedTab);
                this.insertTab(tab, false);

                if (tab.isFocused()) {
                    focusedTab = tab;
                }
            }

            if (focusedTab) {
                // avoid incomplete scroll at startup
                setTimeout(() => {
                    this.scrollManipulator.scrollToElement(focusedTab.htmlElement);
                }, 1);
            }
        }).executeAll('init');
    }

    private createNoTabMatchesSearchElement() {
        const element = document.createElement('div');
        element.classList.add('no-tab-matches-search');
        element.classList.add('hide');
        element.textContent = 'No tab matches your search';

        return element;
    }

    private createTab(openedTab: OpenedTab) {
        const tab = this.tabFactory.create(openedTab.id);
        tab.setFaviconUrl(openedTab.faviconUrl);
        tab.setTabUrl(openedTab.url);
        tab.setTitle(openedTab.title);
        tab.setPosition(openedTab.position);
        openedTab.isAudible ? tab.markAsAudible() : tab.markAsNotAudible();
        openedTab.isAudioMuted ? tab.markAsAudioMuted() : tab.markAsNotAudioMuted();
        openedTab.isDiscarded ? tab.markAsDiscarded() : tab.markAsNotDiscarded();
        openedTab.isFocused ? tab.markAsFocused() : tab.markAsNotFocused();
        openedTab.isLoading ? tab.markAsLoading() : tab.markAsNotLoading();
        openedTab.isPinned ? tab.markAsPinned() : tab.markAsNotPinned();

        for (const tagId of openedTab.tabTagIdList) {
            tab.addTag(tagId);
        }

        return tab;
    }

    private insertTab(tabToInsert: Tab, insertAtTabPosition: boolean) {
        if (this.tabMap.has(tabToInsert.id)) {
            return;
        }

        this.tabMap.set(tabToInsert.id, tabToInsert);
        this.subContainerElement.insertAdjacentElement('beforeend', tabToInsert.htmlElement);

        tabToInsert.observeSelectStateChange(this.onTabSelectStateChange.bind(this));
        tabToInsert.observeShiftClick(this.onTabSelectorShiftClick.bind(this));

        if (tabToInsert.isSelected()) {
            this.onTabSelectStateChange(tabToInsert.id, true);
        }
    }

    getTotalNumberOfTabs(): number {
        return this.tabMap.size;
    }

    getTab(openedTabId: string): Tab {
        return this.tabMap.get(openedTabId);
    }

    addTab(tabToAdd: Tab|OpenedTab): void {
        if (!(tabToAdd instanceof Tab)) {
            tabToAdd = this.createTab(tabToAdd);
        }

        this.insertTab(tabToAdd, true);
    }

    removeTab(openedTabId: string) {
        if (!this.tabMap.has(openedTabId)) {
            return;
        }

        const tabToRemove = this.tabMap.get(openedTabId);
        tabToRemove.htmlElement.remove();
        this.tabMap.delete(openedTabId);

        if (!tabToRemove.isFilteredOut()) {
            this.filterTab(openedTabId);
        }

        this.onTabSelectStateChange(openedTabId, false);
    }

    filterTabs(tabsToShow: OpenedTab[]) {
        const showableTabIdList: string[] = [];

        for (const tab of tabsToShow) {
            showableTabIdList.push(tab.id);
        }

        for (const tab of this.tabMap.values()) {
            if (showableTabIdList.indexOf(tab.id) >= 0) {
                tab.markAsNotFilteredOut();
            } else {
                tab.markAsFilteredOut();
            }
        }

        if (showableTabIdList.length > 0) {
            this.noTabMatchesSearchElement.classList.add('hide');
        } else {
            this.noTabMatchesSearchElement.classList.remove('hide');
        }
    }

    unfilterAllTabs() {
        this.noTabMatchesSearchElement.classList.add('hide');

        for (const tab of this.tabMap.values()) {
            tab.markAsNotFilteredOut();
        }
    }

    filterTab(tabId: string) {
        const tab = this.tabMap.get(tabId);

        if (tab) {
            tab.markAsFilteredOut();
        }

        for (const tabToCheck of this.tabMap.values()) {
            if (!tabToCheck.isFilteredOut()) {
                return;
            }
        }

        this.noTabMatchesSearchElement.classList.remove('hide');
    }

    unfilterTab(tabId: string) {
        const tab = this.tabMap.get(tabId);

        if (tab) {
            this.noTabMatchesSearchElement.classList.add('hide');
            tab.markAsNotFilteredOut();
        }
    }

    addTagToTab(tabId: string, tagId: string) {
        const tab = this.tabMap.get(tabId);

        if (tab) {
            tab.addTag(tagId);
        }
    }

    removeTagFromTab(tabId: string, tagId: string) {
        const tab = this.tabMap.get(tabId);

        if (tab) {
            tab.removeTag(tagId);
        }
    }

    selectAllVisibleTabs() {
        for (const tab of this.tabMap.values()) {
            if (!tab.isHidden()) {
                tab.markAsSelected();
            }
        }
    }

    unselectAllTabs() {
        for (const tab of this.tabMap.values()) {
            tab.markAsUnselected();
        }
    }

    getSelectedTabIdList() {
        const tabIdList: string[] = [];

        for (const tab of this.getAllTabsSortedByPosition()) {
            if (tab.isSelected()) {
                tabIdList.push(tab.id);
            }
        }

        return tabIdList;
    }

    private getAllTabsSortedByPosition() {
        const tabList = Array.from(this.tabMap.values());
        tabList.sort((a, b) => {
            return a.getPosition() > b.getPosition() ? 1 : -1;
        });

        return tabList;
    }

    getNumberOfSelectedTabs() {
        // TODO cache
        let numberOfSelectedTabs = 0;

        for (const tab of this.tabMap.values()) {
            if (tab.isSelected()) {
                numberOfSelectedTabs++;
            }
        }

        return numberOfSelectedTabs;
    }

    observeNumberOfSelectedTabsChange(observer: NumberOfSelectedTabsChangeObserver) {
        this.numberOfSelectedTabsChangeObserverList.push(observer);
    }

    markTabsAsBeingMoved(tabIdList: string[]) {
        for (const tabId of tabIdList) {
            if (this.tabMap.has(tabId)) {
                this.tabMap.get(tabId).markAsBeingMoved();
            }
        }
    }

    markAllTabsAsNotBeingMoved() {
        for (const tab of this.tabMap.values()) {
            tab.markAsNotBeingMoved();
        }
    }

    getBeingMovedTabIdList() {
        const tabIdList: string[] = [];

        for (const tab of this.getAllTabsSortedByPosition()) {
            if (tab.isBeingMoved()) {
                tabIdList.push(tab.id);
            }
        }

        return tabIdList;
    }

    enableMiddleClickClose(tabId?: string) {
        if (tabId) {
            const tab = this.tabMap.get(tabId);

            if (tab) {
                tab.enableMiddleClick();
            }
        } else {
            for (const tab of this.tabMap.values()) {
                tab.enableMiddleClick();
            }
        }
    }

    disableMiddleClickClose(tabId?: string) {
        if (tabId) {
            const tab = this.tabMap.get(tabId);

            if (tab) {
                tab.disableMiddleClick();
            }
        } else {
            for (const tab of this.tabMap.values()) {
                tab.disableMiddleClick();
            }
        }
    }

    async onTabLoading(event: OpenedTabIsLoading) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsLoading();
        }).executeAll(event.tabId);
    }

    async onTabLoadingComplete(event: OpenedTabLoadingIsComplete) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsNotLoading();
        }).executeAll(event.tabId);
    }

    async onTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isAudible ? tab.markAsAudible() : tab.markAsNotAudible();
        }).executeAll(event.tabId);
    }

    async onTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isAudioMuted ? tab.markAsAudioMuted() : tab.markAsNotAudioMuted();
        }).executeAll(event.tabId);
    }

    async onTabDiscardStateUpdate(event: OpenedTabDiscardStateUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isDiscarded ? tab.markAsDiscarded() : tab.markAsNotDiscarded();
        }).executeAll(event.tabId);
    }

    async onTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setFaviconUrl(event.faviconUrl);
        }).executeAll(event.tabId);
    }

    async onTabFocus(event: OpenedTabFocused) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);

            if (tab.isFocused()) {
                return;
            }

            tab.markAsFocused();
            tab.markAsNotDiscarded();
        }).executeAll(event.tabId);
    }

    async onTabUnfocus(event: OpenedTabUnfocused) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsNotFocused();
        }).executeAll(event.tabId);
    }

    async onTabMove(event: OpenedTabMoved) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tabToMove = this.tabMap.get(event.tabId);
            tabToMove.setPosition(event.position);
        }).executeAll(event.tabId);
    }

    async onTabPositionUpdate(event: OpenedTabPositionUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setPosition(event.position);
        }).executeAll(event.tabId);
    }

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isPinned ? tab.markAsPinned() : tab.markAsNotPinned();
        }).executeAll(event.tabId);
    }

    async onTabTitleUpdate(event: OpenedTabTitleUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setTitle(event.title);
        }).executeAll(event.tabId);
    }

    async onTabUrlUpdate(event: OpenedTabUrlUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setTabUrl(event.url);
        }).executeAll(event.tabId);
    }

    onTabSelectStateChange(openedTabId: string, isSelected: boolean) {
        const tab = this.tabMap.get(openedTabId);

        if (tab) {
            this.lastSelectorClicked = tab;
        }

        for (const observer of this.numberOfSelectedTabsChangeObserverList) {
            observer(this.tabListId);
        }
    }

    onTabSelectorShiftClick(openedTabId: string) {
        if (null == this.lastSelectorClicked) {
            return;
        }

        const clickedTab = this.tabMap.get(openedTabId);
        const isClickedTabSelected = clickedTab.isSelected();
        const tabList = this.getTabsBetweenTwoId(openedTabId, this.lastSelectorClicked.id);

        for (const tab of tabList) {
            if (tab.isHidden()) {
                continue;
            } else if (isClickedTabSelected) {
                tab.markAsSelected();
            } else {
                tab.markAsUnselected();
            }
        }

        this.lastSelectorClicked = clickedTab;
    }

    private getTabsBetweenTwoId(fromTabId: string, toTabId: string): Tab[] {
        let fromTab = this.tabMap.get(fromTabId);
        let toTab = this.tabMap.get(toTabId);
        let fromPosition = fromTab.getPosition();
        let toPosition = toTab.getPosition();
        const tabList: Tab[] = [];

        if (fromPosition > toPosition) {
            const tmpToposition = toPosition;
            const tmpToTab = toTab;
            toPosition = fromPosition;
            fromPosition = tmpToposition;
            toTab = fromTab;
            fromTab = tmpToTab;
        }

        for (const tab of this.tabMap.values()) {
            if (
                tab.getPosition() >= fromTab.getPosition()
                && tab.getPosition() <= toTab.getPosition()
            ) {
                tabList.push(tab);
            }
        }

        return tabList;
    }
}

export class TabListFactory {
    constructor(private eventBus: EventBus, private tabFactory: TabFactory, private scrollManipulator: ScrollManipulator) {
    }

    create(tabListId: string, containerElement: HTMLElement, taskScheduler: PerGroupTaskScheduler) {
        return new TabList(tabListId, containerElement, this.eventBus, this.tabFactory, this.scrollManipulator, taskScheduler);
    }
}
