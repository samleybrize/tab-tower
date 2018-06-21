import { EventBus } from '../../../bus/event-bus';
import { OpenedTabAudibleStateUpdated } from '../../../tab/opened-tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../../../tab/opened-tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabClosed } from '../../../tab/opened-tab/event/opened-tab-closed';
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
import { TaskScheduler } from '../../../utils/task-scheduler';
import { Tab, TabFactory } from './tab';

export class TabList {
    private tabMap = new Map<string, Tab>();
    private sortedTabList: Tab[] = [];
    private noTabMatchesSearchElement: HTMLElement;

    constructor(
        public readonly workspaceId: string,
        public readonly containerElement: HTMLElement,
        private eventBus: EventBus,
        private tabFactory: TabFactory,
        private taskScheduler: TaskScheduler,
    ) {
        eventBus.subscribe(OpenedTabClosed, this.onTabClose, this);
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

    shutdown() {
        // TODO will not work
        this.eventBus.unsubscribe(OpenedTabClosed, this.onTabClose);
        this.eventBus.unsubscribe(OpenedTabIsLoading, this.onTabLoading);
        this.eventBus.unsubscribe(OpenedTabLoadingIsComplete, this.onTabLoadingComplete);
        this.eventBus.unsubscribe(OpenedTabAudibleStateUpdated, this.onTabAudibleStateUpdate);
        this.eventBus.unsubscribe(OpenedTabAudioMuteStateUpdated, this.onTabAudioMuteStateUpdate);
        this.eventBus.unsubscribe(OpenedTabDiscardStateUpdated, this.onTabDiscardStateUpdate);
        this.eventBus.unsubscribe(OpenedTabFaviconUrlUpdated, this.onTabFaviconUrlUpdate);
        this.eventBus.unsubscribe(OpenedTabFocused, this.onTabFocus);
        this.eventBus.unsubscribe(OpenedTabMoved, this.onTabMove);
        this.eventBus.unsubscribe(OpenedTabPinStateUpdated, this.onTabPinStateUpdate);
        this.eventBus.unsubscribe(OpenedTabPositionUpdated, this.onTabPositionUpdate);
        this.eventBus.unsubscribe(OpenedTabTitleUpdated, this.onTabTitleUpdate);
        this.eventBus.unsubscribe(OpenedTabUnfocused, this.onTabUnfocus);
        this.eventBus.unsubscribe(OpenedTabUrlUpdated, this.onTabUrlUpdate);
    }

    async init(openTabList: OpenedTab[]) {
        await this.taskScheduler.add(async () => {
            this.noTabMatchesSearchElement = this.createNoTabMatchesSearchElement();
            this.containerElement.appendChild(this.noTabMatchesSearchElement);

            for (const openedTab of openTabList) {
                const tab = this.createTab(openedTab);
                this.insertTab(tab, false);
            }

            this.reorderSortedTabList();
        }).executeAll();
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

        return tab;
    }

    private insertTab(tabToInsert: Tab, insertAtTabPosition: boolean) {
        if (this.tabMap.has(tabToInsert.id)) {
            return;
        }

        if (insertAtTabPosition) {
            this.insertTabAtPosition(tabToInsert, tabToInsert.getPosition());
        } else {
            this.insertTabAsLastTab(tabToInsert);
        }
    }

    private insertTabAtPosition(tabToInsert: Tab, targetPosition: number) {
        this.tabMap.set(tabToInsert.id, tabToInsert);
        let insertAtTheEnd = true;

        const insertAtIndex = this.sortedTabList.findIndex((tab) => {
            return tab.id !== tabToInsert.id && tab.getPosition() >= targetPosition;
        });

        if (insertAtIndex >= 0) {
            this.sortedTabList[insertAtIndex].htmlElement.insertAdjacentElement('beforebegin', tabToInsert.htmlElement);
            this.sortedTabList.splice(insertAtIndex, 0, tabToInsert);
            insertAtTheEnd = false;
        }

        if (insertAtTheEnd) {
            this.insertTabAsLastTab(tabToInsert);
        }
    }

    private insertTabAsLastTab(tabToInsert: Tab) {
        this.containerElement.insertAdjacentElement('beforeend', tabToInsert.htmlElement);
        this.tabMap.set(tabToInsert.id, tabToInsert);
        this.sortedTabList.push(tabToInsert);
    }

    private reorderSortedTabList() {
        this.sortedTabList.sort((a, b) => {
            return a.getPosition() > b.getPosition() ? 1 : -1;
        });
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

        this.removeTabFromSortedTabList(tabToRemove);
    }

    private removeTabFromSortedTabList(tabToRemove: Tab) {
        const indexInSortedTabList = this.sortedTabList.indexOf(tabToRemove);

        if (indexInSortedTabList >= 0) {
            this.sortedTabList.splice(indexInSortedTabList, 1);
        }
    }

    filterTabs(tabsToShow: OpenedTab[]) {
        const showableTabIdList: string[] = [];

        for (const tab of tabsToShow) {
            showableTabIdList.push(tab.id);
        }

        for (const tab of this.sortedTabList) {
            if (showableTabIdList.indexOf(tab.id) >= 0) {
                tab.unhide();
            } else {
                tab.hide();
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

        for (const tab of this.sortedTabList) {
            tab.unhide();
        }
    }

    async onTabClose(event: OpenedTabClosed) {
        await this.taskScheduler.add(async () => {
            this.removeTab(event.closedTab.id);
        }).executeAll();
    }

    async onTabLoading(event: OpenedTabIsLoading) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsLoading();
        }).executeAll();
    }

    async onTabLoadingComplete(event: OpenedTabLoadingIsComplete) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsNotLoading();
        }).executeAll();
    }

    async onTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isAudible ? tab.markAsAudible() : tab.markAsNotAudible();
        }).executeAll();
    }

    async onTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isAudioMuted ? tab.markAsAudioMuted() : tab.markAsNotAudioMuted();
        }).executeAll();
    }

    async onTabDiscardStateUpdate(event: OpenedTabDiscardStateUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isDiscarded ? tab.markAsDiscarded() : tab.markAsNotDiscarded();
        }).executeAll();
    }

    async onTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setFaviconUrl(event.faviconUrl);
        }).executeAll();
    }

    async onTabFocus(event: OpenedTabFocused) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsFocused();
        }).executeAll();
    }

    async onTabUnfocus(event: OpenedTabUnfocused) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.markAsNotFocused();
        }).executeAll();
    }

    async onTabMove(event: OpenedTabMoved) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tabToMove = this.tabMap.get(event.tabId);
            this.removeTabFromSortedTabList(tabToMove);
            this.insertTabAtPosition(tabToMove, event.position);
            tabToMove.setPosition(event.position);
        }).executeAll();
    }

    async onTabPositionUpdate(event: OpenedTabPositionUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setPosition(event.position);
        }).executeAll();
    }

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            event.isPinned ? tab.markAsPinned() : tab.markAsNotPinned();
        }).executeAll();
    }

    async onTabTitleUpdate(event: OpenedTabTitleUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setTitle(event.title);
        }).executeAll();
    }

    async onTabUrlUpdate(event: OpenedTabUrlUpdated) {
        await this.taskScheduler.add(async () => {
            if (!this.tabMap.has(event.tabId)) {
                return;
            }

            const tab = this.tabMap.get(event.tabId);
            tab.setTabUrl(event.url);
        }).executeAll();
    }
}

export class TabListFactory {
    constructor(private eventBus: EventBus, private tabFactory: TabFactory) {
    }

    create(workspaceId: string, containerElement: HTMLElement, taskScheduler: TaskScheduler) {
        return new TabList(workspaceId, containerElement, this.eventBus, this.tabFactory, taskScheduler);
    }
}
