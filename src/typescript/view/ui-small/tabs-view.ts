import { CommandBus } from '../../bus/command-bus';
import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { CloseTabOnMiddleClickConfigured } from '../../settings/event/close-tab-on-middle-click-configured';
import { ShowCloseButtonOnTabHoverConfigured } from '../../settings/event/show-close-button-on-tab-hover-configured';
import { ShowTabTitleOnSeveralLinesConfigured } from '../../settings/event/show-tab-title-on-several-lines-configured';
import { ShowTabUrlOnSeveralLinesConfigured } from '../../settings/event/show-tab-url-on-several-lines-configured';
import { TabAddressToShowConfigured } from '../../settings/event/tab-address-to-show-configured';
import { GetSettings } from '../../settings/query/get-settings';
import { TabAddressTypes } from '../../settings/settings';
import { MoveOpenedTabs } from '../../tab/opened-tab/command/move-opened-tabs';
import { OpenedTabAudibleStateUpdated } from '../../tab/opened-tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../../tab/opened-tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabClosed } from '../../tab/opened-tab/event/opened-tab-closed';
import { OpenedTabFaviconUrlUpdated } from '../../tab/opened-tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../../tab/opened-tab/event/opened-tab-focused';
import { OpenedTabIsLoading } from '../../tab/opened-tab/event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from '../../tab/opened-tab/event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from '../../tab/opened-tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../../tab/opened-tab/event/opened-tab-pin-state-updated';
import { OpenedTabTitleUpdated } from '../../tab/opened-tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../../tab/opened-tab/event/opened-tab-url-updated';
import { TabOpened } from '../../tab/opened-tab/event/tab-opened';
import { TabTagAddedToOpenedTab } from '../../tab/opened-tab/event/tab-tag-added-to-opened-tab';
import { TabTagRemovedFromOpenedTab } from '../../tab/opened-tab/event/tab-tag-removed-from-opened-tab';
import { OpenedTab } from '../../tab/opened-tab/opened-tab';
import { GetOpenedTabs, GetTabCountForAllTags } from '../../tab/opened-tab/query';
import { TabTagCreated } from '../../tab/tab-tag/event/tab-tag-created';
import { TabTagDeleted } from '../../tab/tab-tag/event/tab-tag-deleted';
import { TabTagUpdated } from '../../tab/tab-tag/event/tab-tag-updated';
import { GetTabTags } from '../../tab/tab-tag/query/get-tab-tags';
import { PerGroupTaskScheduler, PerGroupTaskSchedulerFactory } from '../../utils/per-group-task-scheduler';
import { Checkbox } from '../components/checkbox';
import { CloseContextMenus } from '../components/command/close-context-menus';
import { ScrollManipulator } from '../utils/scroll-manipulator';
import { ShowSidenav } from './sidenav/command/show-sidenav';
import { MarkAllTabsAsNotBeingMoved } from './tabs-view/command/mark-all-tabs-as-not-being-moved';
import { MarkTabsAsBeingMoved } from './tabs-view/command/mark-tabs-as-being-moved';
import { MoveTabsMarkedAsBeingMovedAboveTab } from './tabs-view/command/move-tabs-marked-as-being-moved-above-tab';
import { MoveTabsMarkedAsBeingMovedBelowAll } from './tabs-view/command/move-tabs-marked-as-being-moved-below-all';
import { ShowAllOpenedTabs } from './tabs-view/command/show-all-opened-tabs';
import { ShowTagTabs } from './tabs-view/command/show-tag-tabs';
import { CurrentTabListIndicator } from './tabs-view/current-tab-list';
import { NewTabButtonFactory } from './tabs-view/new-tab-button';
import { GetCurrentTabListSelectedTabs } from './tabs-view/query/get-current-tab-list-selected-tabs';
import { SelectedTabsActions, SelectedTabsActionsFactory } from './tabs-view/selected-tabs-actions';
import { Tab, TabFactory } from './tabs-view/tab';
import { TabFilter, TabFilterFactory } from './tabs-view/tab-filter';
import { TabList, TabListFactory } from './tabs-view/tab-list';

enum TabListIds {
    OPENED_TABS = 'opened-tabs',
    PINNED_TABS = 'pinned-tabs',
}

export class TabsView {
    private tabFilter: TabFilter;
    private generalTabSelector: Checkbox;
    private selectedTabsActions: SelectedTabsActions;
    private openedTabsTabList: TabList;
    private pinnedTabsTabList: TabList;
    private stickyFocusedTab: Tab;
    private tabLists: TabList[] = [];
    private currentTabListIndicatorMap = new Map<string, CurrentTabListIndicator>();
    private enabledCurrentTabListIndicator: CurrentTabListIndicator;
    private currentTabListIndicatorContainerElement: HTMLElement;
    private tabListStylesMap = new Map<string, HTMLElement>();

    constructor(
        private containerElement: HTMLElement,
        private tabListFactory: TabListFactory,
        tabFactory: TabFactory,
        tabFilterFactory: TabFilterFactory,
        newTabButtonFactory: NewTabButtonFactory,
        selectedTabsActionsFactory: SelectedTabsActionsFactory,
        private commandBus: CommandBus,
        eventBus: EventBus,
        private queryBus: QueryBus,
        private taskScheduler: PerGroupTaskScheduler,
        private scrollManipulator: ScrollManipulator,
    ) {
        this.tabFilter = tabFilterFactory.create(containerElement.querySelector('.filter'));
        this.generalTabSelector = new Checkbox(containerElement.querySelector('.general-tab-selector'), 'general-tab-selector', 'unchecked');
        newTabButtonFactory.create(containerElement.querySelector('.new-tab-button i'));
        this.selectedTabsActions = selectedTabsActionsFactory.create(containerElement.querySelector('.selected-tabs-actions-button i'));
        this.currentTabListIndicatorContainerElement = containerElement.querySelector('.current-tab-list');

        queryBus.register(GetCurrentTabListSelectedTabs, this.queryCurrentTabListSelectedTabs, this);

        commandBus.register(MarkAllTabsAsNotBeingMoved, this.markAllTabsAsNotBeingMoved, this);
        commandBus.register(MarkTabsAsBeingMoved, this.markTabsAsBeingMoved, this);
        commandBus.register(MoveTabsMarkedAsBeingMovedAboveTab, this.moveTabsMarkedAsBeingMovedAboveTab, this);
        commandBus.register(MoveTabsMarkedAsBeingMovedBelowAll, this.moveTabsMarkedAsBeingMovedBelowAll, this);
        commandBus.register(ShowAllOpenedTabs, this.showAllOpenedTabs, this);
        commandBus.register(ShowTagTabs, this.showTagTabs, this);

        this.taskScheduler.add('init', async () => {
            eventBus.subscribe(TabOpened, this.onTabOpen, this);
            eventBus.subscribe(OpenedTabIsLoading, this.onTabLoading, this);
            eventBus.subscribe(OpenedTabLoadingIsComplete, this.onTabLoadingComplete, this);
            eventBus.subscribe(OpenedTabAudibleStateUpdated, this.onTabAudibleStateUpdate, this);
            eventBus.subscribe(OpenedTabAudioMuteStateUpdated, this.onTabAudioMuteStateUpdate, this);
            eventBus.subscribe(OpenedTabClosed, this.onTabClose, this);
            eventBus.subscribe(OpenedTabFaviconUrlUpdated, this.onTabFaviconUrlUpdate, this);
            eventBus.subscribe(OpenedTabFocused, this.onTabFocus, this);
            eventBus.subscribe(OpenedTabMoved, this.onTabMove, this);
            eventBus.subscribe(OpenedTabPinStateUpdated, this.onTabPinStateUpdate, this);
            eventBus.subscribe(OpenedTabTitleUpdated, this.onTabTitleUpdate, this);
            eventBus.subscribe(OpenedTabUrlUpdated, this.onTabUrlUpdate, this);

            eventBus.subscribe(TabTagCreated, this.onTabTagCreate, this);
            eventBus.subscribe(TabTagDeleted, this.onTabTagDelete, this);
            eventBus.subscribe(TabTagUpdated, this.onTabTagUpdate, this);
            eventBus.subscribe(TabTagAddedToOpenedTab, this.onTabTagAddedToOpenedTab, this);
            eventBus.subscribe(TabTagRemovedFromOpenedTab, this.onTabTagRemovedFromOpenedTab, this);

            eventBus.subscribe(CloseTabOnMiddleClickConfigured, this.onCloseTabOnMiddleClickConfigure, this);
            eventBus.subscribe(ShowCloseButtonOnTabHoverConfigured, this.onShowCloseButtonOnTabHoverConfigure, this);
            eventBus.subscribe(ShowTabTitleOnSeveralLinesConfigured, this.onShowTabTitleOnSeveralLinesConfigure, this);
            eventBus.subscribe(ShowTabUrlOnSeveralLinesConfigured, this.onShowTabUrlOnSeveralLinesConfigure, this);
            eventBus.subscribe(TabAddressToShowConfigured, this.onTabAddressToShowConfigure, this);

            this.stickyFocusedTab = tabFactory.create('focused');
            this.stickyFocusedTab.observeClickOnTitle(() => {
                this.scrollToFocusedTab();
            });
            containerElement.querySelector('.focused-tab').append(this.stickyFocusedTab.htmlElement);

            await this.createOpenedTabList();
            this.enableCurrentTabListIndicator(TabListIds.OPENED_TABS);
            await this.initTabTagLists();

            this.tabFilter.init();
            this.tabFilter.observeFilterResultRetrieval(this.onTabFilterResultRetrieve.bind(this));
            this.tabFilter.observeFilterClear(this.onTabFilterClear.bind(this));
            this.generalTabSelector.observeStateChange(this.onGeneralTabSelectorStateChange.bind(this));

            this.applySettings();
        }).executeAll('init');

        const moveBelowAllButton = containerElement.querySelector('.move-below-all-button');
        moveBelowAllButton.addEventListener('click', () => {
            this.commandBus.handle(new MoveTabsMarkedAsBeingMovedBelowAll());
        });

        const cancelTabMoveButton = containerElement.querySelector('.cancel-tab-move-button i');
        cancelTabMoveButton.addEventListener('click', () => {
            this.commandBus.handle(new MarkAllTabsAsNotBeingMoved());
        });

        const showSidenavButton = containerElement.querySelector('.sidenav-button');
        showSidenavButton.addEventListener('click', () => {
            this.commandBus.handle(new ShowSidenav());
        });
        showSidenavButton.setAttribute('data-init', '1'); // needed for functional tests
    }

    private async createOpenedTabList() {
        const unpinnedTabListContainerElement = this.containerElement.querySelector('.unpinned-tabs') as HTMLElement;
        this.openedTabsTabList = this.tabListFactory.create(TabListIds.OPENED_TABS, unpinnedTabListContainerElement, this.taskScheduler);

        const pinnedTabsContainerElement = this.containerElement.querySelector('.pinned-tabs') as HTMLElement;
        this.pinnedTabsTabList = this.tabListFactory.create(TabListIds.PINNED_TABS, pinnedTabsContainerElement, this.taskScheduler);

        this.createCurrentTabListIndicator(TabListIds.OPENED_TABS, 'All opened tabs');

        await this.populateOpenedTabList();
    }

    private createCurrentTabListIndicator(tabListId: string, tabListLabel: string) {
        const currentTabListIndicator = new CurrentTabListIndicator(this.currentTabListIndicatorContainerElement, tabListLabel);
        this.currentTabListIndicatorMap.set(tabListId, currentTabListIndicator);

        const styleElement = document.createElement('style');
        const headElement = document.querySelector('head');
        headElement.appendChild(styleElement);
        styleElement.textContent = `
            .ui-small [data-show-tag="${tabListId}"] .unpinned-tabs .tab.with-tag-${tabListId} {
                display: flex;
            }
        `;
        this.tabListStylesMap.set(tabListId, styleElement);

        return currentTabListIndicator;
    }

    private async populateOpenedTabList() {
        const openedTabList = await this.queryBus.query(new GetOpenedTabs());
        const unpinnedTabsTabList: OpenedTab[] = [];
        const pinnedTabsTabList: OpenedTab[] = [];

        for (const openedTab of openedTabList) {
            if (openedTab.isPinned) {
                pinnedTabsTabList.push(openedTab);
            } else {
                unpinnedTabsTabList.push(openedTab);
            }

            if (openedTab.isFocused) {
                this.stickyFocusedTab.id = openedTab.id;
                this.stickyFocusedTab.setTitle(openedTab.title);
                this.stickyFocusedTab.setFaviconUrl(openedTab.faviconUrl);
                openedTab.isAudible ? this.stickyFocusedTab.markAsAudible() : this.stickyFocusedTab.markAsNotAudible();
                openedTab.isAudioMuted ? this.stickyFocusedTab.markAsAudioMuted() : this.stickyFocusedTab.markAsNotAudioMuted();
                openedTab.isLoading ? this.stickyFocusedTab.markAsLoading() : this.stickyFocusedTab.markAsNotLoading();
            }
        }

        this.currentTabListIndicatorMap.get(TabListIds.OPENED_TABS).setNumberOfTabs(openedTabList.length);
        await this.initTabList(this.openedTabsTabList, unpinnedTabsTabList);
        await this.initTabList(this.pinnedTabsTabList, pinnedTabsTabList);
    }

    private async initTabList(tabList: TabList, openedTabList: OpenedTab[]) {
        this.tabLists.push(tabList);

        tabList.containerElement.setAttribute('data-tab-list-id', tabList.tabListId);
        tabList.observeNumberOfSelectedTabsChange(this.onNumberOfSelectedTabsChange.bind(this));

        await tabList.init(openedTabList);
    }

    private onNumberOfSelectedTabsChange(tabListId: string) {
        if (TabListIds.PINNED_TABS !== tabListId && TabListIds.OPENED_TABS !== tabListId) {
            return;
        }

        const totalNumberOfSelectedTabs = this.pinnedTabsTabList.getNumberOfSelectedTabs() + this.openedTabsTabList.getNumberOfSelectedTabs();

        if (0 === totalNumberOfSelectedTabs) {
            this.generalTabSelector.markAsUnchecked();
            this.selectedTabsActions.hide();
        } else {
            this.generalTabSelector.markAsChecked();
            this.selectedTabsActions.showContextMenuOpener();
        }
    }

    private enableCurrentTabListIndicator(tabListId: string) {
        if (this.enabledCurrentTabListIndicator) {
            this.enabledCurrentTabListIndicator.disable();
        }

        const currentTabListIndicator = this.currentTabListIndicatorMap.get(tabListId);

        if (currentTabListIndicator) {
            currentTabListIndicator.enable();
            this.enabledCurrentTabListIndicator = currentTabListIndicator;
        }
    }

    private async initTabTagLists() {
        const tagList = await this.queryBus.query(new GetTabTags());

        for (const tag of tagList) {
            this.createCurrentTabListIndicator(tag.id, tag.label);
        }

        const tabCountList = await this.queryBus.query(new GetTabCountForAllTags());
        tabCountList.forEach((numberOfTabs, tagId) => {
            const tagIndicator = this.currentTabListIndicatorMap.get(tagId);

            if (tagIndicator) {
                tagIndicator.setNumberOfTabs(numberOfTabs);
            }
        });
    }

    private onTabFilterResultRetrieve(matchingTabs: OpenedTab[]) {
        for (const tabList of this.tabLists) {
            tabList.filterTabs(matchingTabs);
        }
    }

    private onTabFilterClear() {
        for (const tabList of this.tabLists) {
            tabList.unfilterAllTabs();
        }
    }

    private onGeneralTabSelectorStateChange(selectorId: string, isChecked: boolean) {
        if (isChecked) {
            this.openedTabsTabList.selectAllVisibleTabs();
            this.pinnedTabsTabList.selectAllVisibleTabs();
            this.selectedTabsActions.showContextMenuOpener();
        } else {
            this.openedTabsTabList.unselectAllTabs();
            this.pinnedTabsTabList.unselectAllTabs();
            this.selectedTabsActions.hide();
        }
    }

    private async applySettings(tabId?: string) {
        const settings = await this.queryBus.query(new GetSettings());
        this.setCloseTabOnMiddleClickStatus(settings.tabs.closeTabOnMiddleClick, tabId);
        this.setShowCloseButtonOnHoverStatus(settings.tabs.showCloseButtonOnHover);
        this.setShowTabTitleOnSeveralLinesStatus(settings.tabs.showTitleOnSeveralLines);
        this.setShowTabUrlOnSeveralLinesStatus(settings.tabs.showUrlOnSeveralLines);
        this.setTabAddressToShow(settings.tabs.addressToShow);
    }

    private setCloseTabOnMiddleClickStatus(closeTabOnMiddleClick: boolean, tabId?: string) {
        for (const tabList of this.tabLists) {
            if (closeTabOnMiddleClick) {
                tabList.enableMiddleClickClose(tabId);
            } else {
                tabList.disableMiddleClickClose(tabId);
            }
        }
    }

    private setShowCloseButtonOnHoverStatus(showCloseButtonOnHover: boolean) {
        if (showCloseButtonOnHover) {
            this.containerElement.classList.remove('no-close-button');
        } else {
            this.containerElement.classList.add('no-close-button');
        }
    }

    private setShowTabTitleOnSeveralLinesStatus(showTabTitleOnSeveralLines: boolean) {
        if (showTabTitleOnSeveralLines) {
            this.containerElement.classList.add('multiline-tab-title');
        } else {
            this.containerElement.classList.remove('multiline-tab-title');
        }
    }

    private setShowTabUrlOnSeveralLinesStatus(showTabUrlOnSeveralLines: boolean) {
        if (showTabUrlOnSeveralLines) {
            this.containerElement.classList.add('multiline-tab-url');
        } else {
            this.containerElement.classList.remove('multiline-tab-url');
        }
    }

    private setTabAddressToShow(tabAddressToShow: TabAddressTypes) {
        if ('url' == tabAddressToShow) {
            this.containerElement.classList.add('show-tab-url');
            this.containerElement.classList.remove('show-tab-domain');
        } else if ('domain' == tabAddressToShow) {
            this.containerElement.classList.remove('show-tab-url');
            this.containerElement.classList.add('show-tab-domain');
        } else {
            this.containerElement.classList.remove('show-tab-url');
            this.containerElement.classList.remove('show-tab-domain');
        }
    }

    async onTabOpen(event: TabOpened) {
        await this.taskScheduler.add(event.tab.id, async () => {
            if (event.tab.isPinned) {
                this.pinnedTabsTabList.addTab(event.tab);
            } else {
                this.openedTabsTabList.addTab(event.tab);
            }

            if (await this.tabFilter.isTabSatisfiesFilter(event.tab.id)) {
                this.unfilterTabOnAllTabLists(event.tab.id);
            } else {
                this.filterTabOnAllTabLists(event.tab.id);
            }

            this.closeContextMenus();
            this.currentTabListIndicatorMap.get(TabListIds.OPENED_TABS).incrementNumberOfTabs();
            this.applySettings(event.tab.id);

            for (const tagId of event.tab.tabTagIdList) {
                const tagIndicator = this.currentTabListIndicatorMap.get(tagId);

                if (tagIndicator) {
                    tagIndicator.incrementNumberOfTabs();
                }
            }
        }).executeAll(event.tab.id);
    }

    private filterTabOnAllTabLists(tabId: string) {
        for (const tabList of this.tabLists) {
            tabList.filterTab(tabId);
        }
    }

    private unfilterTabOnAllTabLists(tabId: string) {
        for (const tabList of this.tabLists) {
            tabList.unfilterTab(tabId);
        }
    }

    private closeContextMenus() {
        this.commandBus.handle(new CloseContextMenus());
    }

    async onTabClose(event: OpenedTabClosed) {
        await this.taskScheduler.add(event.closedTab.id, async () => {
            this.closeContextMenus();

            for (const tabList of this.tabLists) {
                tabList.removeTab(event.closedTab.id);
            }

            this.currentTabListIndicatorMap.get(TabListIds.OPENED_TABS).decrementNumberOfTabs();
            const tabTagIdList = event.closedTab.tabTagIdList.filter((v, i, a) => a.indexOf(v) === i); // unique values, due to a bug in firefox

            for (const tagId of tabTagIdList) {
                const tagIndicator = this.currentTabListIndicatorMap.get(tagId);

                if (tagIndicator) {
                    tagIndicator.decrementNumberOfTabs();
                }
            }
        }).executeAll(event.closedTab.id);
    }

    async onTabMove(event: OpenedTabMoved) {
        await this.taskScheduler.add(event.tabId, async () => {
            this.closeContextMenus();
        }).executeAll(event.tabId);
    }

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (event.isPinned) {
                this.addToPinnedTabs(event.tabId);
            } else {
                this.removeFromPinnedTabs(event.tabId);
            }

            if (event.tabId === this.stickyFocusedTab.id) {
                event.isPinned ? this.stickyFocusedTab.markAsPinned() : this.stickyFocusedTab.markAsNotPinned();
            }

            this.closeContextMenus();
        }).executeAll(event.tabId);
    }

    private addToPinnedTabs(openedTabId: string) {
        const existingTab = this.openedTabsTabList.getTab(openedTabId);

        if (existingTab) {
            existingTab.markAsPinned();

            this.openedTabsTabList.removeTab(openedTabId);
            this.pinnedTabsTabList.addTab(existingTab);
        }
    }

    private removeFromPinnedTabs(openedTabId: string) {
        const existingTab = this.pinnedTabsTabList.getTab(openedTabId);

        if (existingTab) {
            existingTab.markAsNotPinned();

            this.pinnedTabsTabList.removeTab(openedTabId);
            this.openedTabsTabList.addTab(existingTab);
        }
    }

    async onTabLoading(event: OpenedTabIsLoading) {
        await this.taskScheduler.add('focused-tab', async () => {
            if (event.tabId === this.stickyFocusedTab.id) {
                this.stickyFocusedTab.markAsLoading();
            }
        }).executeAll('focused-tab');
    }

    async onTabLoadingComplete(event: OpenedTabLoadingIsComplete) {
        await this.taskScheduler.add('focused-tab', async () => {
            if (event.tabId === this.stickyFocusedTab.id) {
                this.stickyFocusedTab.markAsNotLoading();
            }
        }).executeAll('focused-tab');
    }

    async onTabTitleUpdate(event: OpenedTabTitleUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (await this.tabFilter.isTabSatisfiesFilter(event.tabId)) {
                this.unfilterTabOnAllTabLists(event.tabId);
            } else {
                this.filterTabOnAllTabLists(event.tabId);
            }
        }).executeAll(event.tabId);

        await this.taskScheduler.add('focused-tab', async () => {
            if (event.tabId === this.stickyFocusedTab.id) {
                this.stickyFocusedTab.setTitle(event.title);
            }
        }).executeAll('focused-tab');
    }

    async onTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        await this.taskScheduler.add('focused-tab', async () => {
            if (event.tabId === this.stickyFocusedTab.id) {
                this.stickyFocusedTab.setFaviconUrl(event.faviconUrl);
            }
        }).executeAll('focused-tab');
    }

    async onTabFocus(event: OpenedTabFocused) {
        await this.taskScheduler.add(event.tabId, async () => {
            const tab = this.openedTabsTabList.getTab(event.tabId) || this.pinnedTabsTabList.getTab(event.tabId);

            if (tab) {
                this.scrollManipulator.scrollToElement(tab.htmlElement);
            }
        }).executeAll(event.tabId);

        await this.taskScheduler.add('focused-tab', async () => {
            const focusedTab = this.openedTabsTabList.getTab(event.tabId) || this.pinnedTabsTabList.getTab(event.tabId);
            this.stickyFocusedTab.id = event.tabId;
            this.stickyFocusedTab.setTitle(focusedTab.getTitle());
            this.stickyFocusedTab.setFaviconUrl(focusedTab.getFaviconUrl());
            focusedTab.isAudible() ? this.stickyFocusedTab.markAsAudible() : this.stickyFocusedTab.markAsNotAudible();
            focusedTab.isAudioMuted() ? this.stickyFocusedTab.markAsAudioMuted() : this.stickyFocusedTab.markAsNotAudioMuted();
            focusedTab.isLoading() ? this.stickyFocusedTab.markAsLoading() : this.stickyFocusedTab.markAsNotLoading();
        }).executeAll('focused-tab');
    }

    private scrollToFocusedTab() {
        const tab = this.openedTabsTabList.getTab(this.stickyFocusedTab.id);

        if (tab) {
            this.scrollManipulator.scrollToElement(tab.htmlElement);
        }
    }

    async onTabUrlUpdate(event: OpenedTabUrlUpdated) {
        await this.taskScheduler.add(event.tabId, async () => {
            if (await this.tabFilter.isTabSatisfiesFilter(event.tabId)) {
                this.unfilterTabOnAllTabLists(event.tabId);
            } else {
                this.filterTabOnAllTabLists(event.tabId);
            }
        }).executeAll(event.tabId);
    }

    async onTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        await this.taskScheduler.add('focused-tab', async () => {
            event.isAudible ? this.stickyFocusedTab.markAsAudible() : this.stickyFocusedTab.markAsNotAudible();
        }).executeAll('focused-tab');
    }

    async onTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        await this.taskScheduler.add('focused-tab', async () => {
            event.isAudioMuted ? this.stickyFocusedTab.markAsAudioMuted() : this.stickyFocusedTab.markAsNotAudioMuted();
        }).executeAll('focused-tab');
    }

    async onCloseTabOnMiddleClickConfigure(event: CloseTabOnMiddleClickConfigured) {
        await this.taskScheduler.add('0', async () => {
            this.setCloseTabOnMiddleClickStatus(event.closeTabOnMiddleClick);
        }).executeAll('0');
    }

    async onShowCloseButtonOnTabHoverConfigure(event: ShowCloseButtonOnTabHoverConfigured) {
        await this.taskScheduler.add('0', async () => {
            this.setShowCloseButtonOnHoverStatus(event.showCloseButton);
        }).executeAll('0');
    }

    async onShowTabTitleOnSeveralLinesConfigure(event: ShowTabTitleOnSeveralLinesConfigured) {
        await this.taskScheduler.add('0', async () => {
            this.setShowTabTitleOnSeveralLinesStatus(event.showTabTitleOnSeveralLines);
        }).executeAll('0');
    }

    async onShowTabUrlOnSeveralLinesConfigure(event: ShowTabUrlOnSeveralLinesConfigured) {
        await this.taskScheduler.add('0', async () => {
            this.setShowTabUrlOnSeveralLinesStatus(event.showTabUrlOnSeveralLines);
        }).executeAll('0');
    }

    async onTabAddressToShowConfigure(event: TabAddressToShowConfigured) {
        await this.taskScheduler.add('0', async () => {
            this.setTabAddressToShow(event.tabAddressToShow);
        }).executeAll('0');
    }

    async queryCurrentTabListSelectedTabs(query: GetCurrentTabListSelectedTabs): Promise<string[]> {
        return this.openedTabsTabList.getSelectedTabIdList().concat(this.pinnedTabsTabList.getSelectedTabIdList());
    }

    async markTabsAsBeingMoved(command: MarkTabsAsBeingMoved) {
        this.containerElement.classList.add('move-mode');
        this.openedTabsTabList.markTabsAsBeingMoved(command.tabIdList);
        this.pinnedTabsTabList.markTabsAsBeingMoved(command.tabIdList);
    }

    async markAllTabsAsNotBeingMoved(command: MarkAllTabsAsNotBeingMoved) {
        await this.taskScheduler.add('0', async () => {
            this.cancelMoveMode();
        }).executeAll('0');
    }

    private cancelMoveMode() {
        this.containerElement.classList.remove('move-mode');
        this.openedTabsTabList.markAllTabsAsNotBeingMoved();
        this.pinnedTabsTabList.markAllTabsAsNotBeingMoved();
    }

    async moveTabsMarkedAsBeingMovedAboveTab(command: MoveTabsMarkedAsBeingMovedAboveTab) {
        await this.taskScheduler.add('0', async () => {
            const tabIdListToMove = this.openedTabsTabList.getBeingMovedTabIdList().concat(this.pinnedTabsTabList.getBeingMovedTabIdList());
            this.cancelMoveMode();
            const targetTab = this.openedTabsTabList.getTab(command.tabId) || this.pinnedTabsTabList.getTab(command.tabId);
            const totalNumberOfTabs = this.openedTabsTabList.getTotalNumberOfTabs() + this.pinnedTabsTabList.getTotalNumberOfTabs();

            if (totalNumberOfTabs === tabIdListToMove.length) {
                return;
            }

            this.commandBus.handle(new MoveOpenedTabs(tabIdListToMove, targetTab.getPosition()));
        }).executeAll('0');
    }

    async moveTabsMarkedAsBeingMovedBelowAll(command: MoveTabsMarkedAsBeingMovedBelowAll) {
        await this.taskScheduler.add('0', async () => {
            const tabIdListToMove = this.openedTabsTabList.getBeingMovedTabIdList().concat(this.pinnedTabsTabList.getBeingMovedTabIdList());
            this.cancelMoveMode();
            const targetPosition = -1;
            const totalNumberOfTabs = this.openedTabsTabList.getTotalNumberOfTabs() + this.pinnedTabsTabList.getTotalNumberOfTabs();

            if (totalNumberOfTabs === tabIdListToMove.length) {
                return;
            }

            this.commandBus.handle(new MoveOpenedTabs(tabIdListToMove, targetPosition));
        }).executeAll('0');
    }

    async showAllOpenedTabs(command: ShowAllOpenedTabs) {
        this.taskScheduler.add('0', async () => {
            this.containerElement.classList.remove('tagged-tabs');
            this.containerElement.removeAttribute('data-show-tag');
            this.enableCurrentTabListIndicator(TabListIds.OPENED_TABS);
            this.openedTabsTabList.showTagTabs(null);
            this.pinnedTabsTabList.showTagTabs(null);
        }).executeAll('0');
    }

    async showTagTabs(command: ShowTagTabs) {
        this.taskScheduler.add('0', async () => {
            this.containerElement.classList.add('tagged-tabs');
            this.containerElement.setAttribute('data-show-tag', command.tagId);
            this.enableCurrentTabListIndicator(command.tagId);
            this.openedTabsTabList.unselectAllTabs();
            this.pinnedTabsTabList.unselectAllTabs();
            this.openedTabsTabList.showTagTabs(command.tagId);
            this.pinnedTabsTabList.showTagTabs(command.tagId);
        }).executeAll('0');
    }

    async onTabTagCreate(event: TabTagCreated) {
        this.createCurrentTabListIndicator(event.tag.id, event.tag.label);
    }

    async onTabTagDelete(event: TabTagDeleted) {
        const associatedCurrentTabListIndicator = this.currentTabListIndicatorMap.get(event.tag.id);

        if (associatedCurrentTabListIndicator === this.enabledCurrentTabListIndicator) {
            this.showAllOpenedTabs(null);
        }

        this.currentTabListIndicatorMap.delete(event.tag.id);
        this.tabListStylesMap.get(event.tag.id).remove();
        this.tabListStylesMap.delete(event.tag.id);
    }

    async onTabTagUpdate(event: TabTagUpdated) {
        this.taskScheduler.add(event.tag.id, async () => {
            const tabListIndicator = this.currentTabListIndicatorMap.get(event.tag.id);

            if (tabListIndicator) {
                tabListIndicator.setLabel(event.tag.label);
            }
        }).executeAll(event.tag.id);
    }

    async onTabTagAddedToOpenedTab(event: TabTagAddedToOpenedTab) {
        this.openedTabsTabList.addTagToTab(event.tabId, event.tagId);
        const tabListIndicator = this.currentTabListIndicatorMap.get(event.tagId);

        if (tabListIndicator) {
            tabListIndicator.incrementNumberOfTabs();
        }
    }

    async onTabTagRemovedFromOpenedTab(event: TabTagRemovedFromOpenedTab) {
        this.openedTabsTabList.removeTagFromTab(event.tabId, event.tagId);
        const tabListIndicator = this.currentTabListIndicatorMap.get(event.tagId);

        if (tabListIndicator) {
            tabListIndicator.decrementNumberOfTabs();
        }
    }
}

export class TabsViewFactory {
    constructor(
        private tabListFactory: TabListFactory,
        private tabFactory: TabFactory,
        private tabFilterFactory: TabFilterFactory,
        private newTabButtonFactory: NewTabButtonFactory,
        private selectedTabsActionsFactory: SelectedTabsActionsFactory,
        private taskSchedulerFactory: PerGroupTaskSchedulerFactory,
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private scrollManipulator: ScrollManipulator,
    ) {
    }

    create(containerElement: HTMLElement) {
        return new TabsView(
            containerElement,
            this.tabListFactory,
            this.tabFactory,
            this.tabFilterFactory,
            this.newTabButtonFactory,
            this.selectedTabsActionsFactory,
            this.commandBus,
            this.eventBus,
            this.queryBus,
            this.taskSchedulerFactory.create(true),
            this.scrollManipulator,
        );
    }
}
