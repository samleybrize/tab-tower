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
import { OpenedTabClosed } from '../../tab/opened-tab/event/opened-tab-closed';
import { OpenedTabMoved } from '../../tab/opened-tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../../tab/opened-tab/event/opened-tab-pin-state-updated';
import { OpenedTabTitleUpdated } from '../../tab/opened-tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../../tab/opened-tab/event/opened-tab-url-updated';
import { TabOpened } from '../../tab/opened-tab/event/tab-opened';
import { OpenedTab } from '../../tab/opened-tab/opened-tab';
import { GetOpenedTabs } from '../../tab/opened-tab/query';
import { Counter } from '../../utils/counter';
import { TaskScheduler, TaskSchedulerFactory } from '../../utils/task-scheduler';
import { Checkbox } from '../components/checkbox';
import { CloseContextMenus } from '../components/command/close-context-menus';
import { MarkAllTabsAsNotBeingMoved } from './tabs-view/command/mark-all-tabs-as-not-being-moved';
import { MarkTabsAsBeingMoved } from './tabs-view/command/mark-tabs-as-being-moved';
import { MoveTabsMarkedAsBeingMovedAboveTab } from './tabs-view/command/move-tabs-marked-as-being-moved-above-tab';
import { MoveTabsMarkedAsBeingMovedBelowAll } from './tabs-view/command/move-tabs-marked-as-being-moved-below-all';
import { CurrentWorkspace } from './tabs-view/current-workspace';
import { NewTabButton, NewTabButtonFactory } from './tabs-view/new-tab-button';
import { GetCurrentWorkspaceSelectedTabs } from './tabs-view/query/get-current-workspace-selected-tabs';
import { SelectedTabsActions, SelectedTabsActionsFactory } from './tabs-view/selected-tabs-actions';
import { TabFilter, TabFilterfactory } from './tabs-view/tab-filter';
import { TabList, TabListFactory } from './tabs-view/tab-list';

enum BuiltinWorkspaces {
    OPENED_TABS = 'opened-tabs',
    PINNED_TABS = 'pinned-tabs',
}

export class TabsView {
    private tabFilter: TabFilter;
    private generalTabSelector: Checkbox;
    private newTabButton: NewTabButton;
    private selectedTabsActions: SelectedTabsActions;
    private pinnedTabList: TabList;
    private workspaceMap = new Map<string, TabList>();
    private workspaceList: TabList[] = [];
    private workspaceInUse: TabList;
    private unpinnedWorkspacesContainerElement: HTMLElement;
    private currentWorkspaceIndicatorMap = new Map<string, CurrentWorkspace>();
    private enabledCurrentWorkspaceIndicator: CurrentWorkspace;
    private currentWorkspaceIndicatorContainerElement: HTMLElement;

    constructor(
        private containerElement: HTMLElement,
        private tabListFactory: TabListFactory,
        tabFilterFactory: TabFilterfactory,
        newTabButtonFactory: NewTabButtonFactory,
        selectedTabsActionsFactory: SelectedTabsActionsFactory,
        private commandBus: CommandBus,
        eventBus: EventBus,
        private queryBus: QueryBus,
        private taskScheduler: TaskScheduler,
    ) {
        this.tabFilter = tabFilterFactory.create(containerElement.querySelector('.filter'));
        this.generalTabSelector = new Checkbox(containerElement.querySelector('.general-tab-selector'), 'general-tab-selector', 'unchecked');
        this.newTabButton = newTabButtonFactory.create(containerElement.querySelector('.new-tab-button i'));
        this.selectedTabsActions = selectedTabsActionsFactory.create(containerElement.querySelector('.selected-tabs-actions-button i'));
        this.unpinnedWorkspacesContainerElement = containerElement.querySelector('.unpinned-tabs');
        this.currentWorkspaceIndicatorContainerElement = containerElement.querySelector('.current-workspace');

        queryBus.register(GetCurrentWorkspaceSelectedTabs, this.queryCurrentWorkspaceSelectedTabs, this);

        commandBus.register(MarkAllTabsAsNotBeingMoved, this.markAllTabsAsNotBeingMoved, this);
        commandBus.register(MarkTabsAsBeingMoved, this.markTabsAsBeingMoved, this);
        commandBus.register(MoveTabsMarkedAsBeingMovedAboveTab, this.moveTabsMarkedAsBeingMovedAboveTab, this);
        commandBus.register(MoveTabsMarkedAsBeingMovedBelowAll, this.moveTabsMarkedAsBeingMovedBelowAll, this);

        this.taskScheduler.add(async () => {
            eventBus.subscribe(TabOpened, this.onTabOpen, this);
            eventBus.subscribe(OpenedTabClosed, this.onTabClose, this);
            eventBus.subscribe(OpenedTabMoved, this.onTabMove, this);
            eventBus.subscribe(OpenedTabPinStateUpdated, this.onTabPinStateUpdate, this);
            eventBus.subscribe(OpenedTabTitleUpdated, this.onTabTitleUpdate, this);
            eventBus.subscribe(OpenedTabUrlUpdated, this.onTabUrlUpdate, this);

            eventBus.subscribe(CloseTabOnMiddleClickConfigured, this.onCloseTabOnMiddleClickConfigure, this);
            eventBus.subscribe(ShowCloseButtonOnTabHoverConfigured, this.onShowCloseButtonOnTabHoverConfigure, this);
            eventBus.subscribe(ShowTabTitleOnSeveralLinesConfigured, this.onShowTabTitleOnSeveralLinesConfigure, this);
            eventBus.subscribe(ShowTabUrlOnSeveralLinesConfigured, this.onShowTabUrlOnSeveralLinesConfigure, this);
            eventBus.subscribe(TabAddressToShowConfigured, this.onTabAddressToShowConfigure, this);

            await this.createOpenedTabWorkspace();
            this.enableWorkspace(BuiltinWorkspaces.OPENED_TABS);

            this.tabFilter.observeFilterResultRetrieval(this.onTabFilterResultRetrieve.bind(this));
            this.tabFilter.observeFilterClear(this.onTabFilterClear.bind(this));
            this.generalTabSelector.observeStateChange(this.onGeneralTabSelectorStateChange.bind(this));

            this.applySettings();
        }).executeAll();

        const moveBelowAllButton = containerElement.querySelector('.move-below-all-button');
        moveBelowAllButton.addEventListener('click', () => {
            this.commandBus.handle(new MoveTabsMarkedAsBeingMovedBelowAll());
        });

        const cancelTabMoveButton = containerElement.querySelector('.cancel-tab-move-button i');
        cancelTabMoveButton.addEventListener('click', () => {
            this.commandBus.handle(new MarkAllTabsAsNotBeingMoved());
        });
    }

    private async createOpenedTabWorkspace() {
        const tabCounter = new Counter();
        const openedTabsContainerElement = this.createUnpinnedTabsWorkspaceContainerElement(BuiltinWorkspaces.OPENED_TABS);
        const openedTabsWorkspace = this.tabListFactory.create(BuiltinWorkspaces.OPENED_TABS, openedTabsContainerElement, this.taskScheduler, tabCounter);
        this.insertUnpinnedTabsWorkspace(openedTabsWorkspace);

        const pinnedTabsContainerElement = this.containerElement.querySelector('.pinned-tabs') as HTMLElement;
        this.pinnedTabList = this.tabListFactory.create(BuiltinWorkspaces.PINNED_TABS, pinnedTabsContainerElement, this.taskScheduler, tabCounter);

        const currentWorkspaceIndicator = this.createCurrentWorkspaceIndicator(BuiltinWorkspaces.OPENED_TABS, 'All opened tabs');
        tabCounter.observe(currentWorkspaceIndicator.setNumberOfTabs.bind(currentWorkspaceIndicator));

        const openedTabList = await this.queryBus.query(new GetOpenedTabs());
        const unpinnedTabList: OpenedTab[] = [];
        const pinnedTabList: OpenedTab[] = [];

        for (const openedTab of openedTabList) {
            if (openedTab.isPinned) {
                pinnedTabList.push(openedTab);
            } else {
                unpinnedTabList.push(openedTab);
            }
        }

        await this.initWorkspace(openedTabsWorkspace, unpinnedTabList);
        await this.initWorkspace(this.pinnedTabList, pinnedTabList);
    }

    private createUnpinnedTabsWorkspaceContainerElement(workspaceId: string) {
        const random = Math.random();
        const workspaceContainerElement = document.createElement('div');
        workspaceContainerElement.id = `tabs-view-workspace-container-${workspaceId}-${random}`;

        return workspaceContainerElement;
    }

    private createCurrentWorkspaceIndicator(workspaceId: string, workspaceLabel: string) {
        const currentWorkspaceIndicator = new CurrentWorkspace(this.currentWorkspaceIndicatorContainerElement, workspaceLabel);
        this.currentWorkspaceIndicatorMap.set(workspaceId, currentWorkspaceIndicator);

        return currentWorkspaceIndicator;
    }

    private async initWorkspace(workspace: TabList, tabList: OpenedTab[]) {
        this.workspaceMap.set(workspace.workspaceId, workspace);
        this.workspaceList.push(workspace);

        workspace.containerElement.setAttribute('data-workspace-id', workspace.workspaceId);
        workspace.observeNumberOfSelectedTabsChange(this.onNumberOfSelectedTabsChange.bind(this));

        await workspace.init(tabList);
    }

    private onNumberOfSelectedTabsChange(workspaceId: string) {
        if (BuiltinWorkspaces.PINNED_TABS !== workspaceId && this.workspaceInUse.workspaceId !== workspaceId) {
            return;
        }

        const totalNumberOfSelectedTabs = this.pinnedTabList.getNumberOfSelectedTabs() + this.workspaceInUse.getNumberOfSelectedTabs();

        if (0 === totalNumberOfSelectedTabs) {
            this.generalTabSelector.markAsUnchecked();
            this.selectedTabsActions.hide();
        } else {
            this.generalTabSelector.markAsChecked();
            this.selectedTabsActions.showContextMenuOpener();
        }
    }

    private insertUnpinnedTabsWorkspace(workspace: TabList) {
        this.unpinnedWorkspacesContainerElement.insertAdjacentElement('afterbegin', workspace.containerElement);
    }

    private enableWorkspace(workspaceId: string) {
        if (this.enabledCurrentWorkspaceIndicator) {
            this.enabledCurrentWorkspaceIndicator.disable();
        }

        const currentWorkspaceIndicator = this.currentWorkspaceIndicatorMap.get(workspaceId);
        currentWorkspaceIndicator.enable();
        this.enabledCurrentWorkspaceIndicator = currentWorkspaceIndicator;
        this.workspaceInUse = this.workspaceMap.get(workspaceId);
    }

    private onTabFilterResultRetrieve(matchingTabs: OpenedTab[]) {
        for (const workspace of this.workspaceList) {
            workspace.filterTabs(matchingTabs);
        }
    }

    private onTabFilterClear() {
        for (const workspace of this.workspaceList) {
            workspace.unfilterAllTabs();
        }
    }

    private onGeneralTabSelectorStateChange(selectorId: string, isChecked: boolean) {
        if (isChecked) {
            this.workspaceInUse.selectAllTabs();
            this.pinnedTabList.selectAllTabs();
            this.selectedTabsActions.showContextMenuOpener();
        } else {
            this.workspaceInUse.unselectAllTabs();
            this.pinnedTabList.unselectAllTabs();
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
        for (const workspace of this.workspaceList) {
            if (closeTabOnMiddleClick) {
                workspace.enableMiddleClickClose(tabId);
            } else {
                workspace.disableMiddleClickClose(tabId);
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
        await this.taskScheduler.add(async () => {
            if (event.tab.isPinned) {
                this.workspaceMap.get(BuiltinWorkspaces.PINNED_TABS).addTab(event.tab);
            } else {
                this.workspaceMap.get(BuiltinWorkspaces.OPENED_TABS).addTab(event.tab);
            }

            if (await this.tabFilter.isTabSatisfiesFilter(event.tab.id)) {
                this.unfilterTabOnAllWorkspaces(event.tab.id);
            } else {
                this.filterTabOnAllWorkspaces(event.tab.id);
            }

            this.closeContextMenus();
            this.applySettings(event.tab.id);
        }).executeAll();
    }

    private filterTabOnAllWorkspaces(tabId: string) {
        for (const workspace of this.workspaceList) {
            workspace.filterTab(tabId);
        }
    }

    private unfilterTabOnAllWorkspaces(tabId: string) {
        for (const workspace of this.workspaceList) {
            workspace.unfilterTab(tabId);
        }
    }

    private closeContextMenus() {
        this.commandBus.handle(new CloseContextMenus());
    }

    async onTabClose(event: OpenedTabClosed) {
        await this.taskScheduler.add(async () => {
            this.closeContextMenus();
        }).executeAll();
    }

    async onTabMove(event: OpenedTabMoved) {
        await this.taskScheduler.add(async () => {
            this.closeContextMenus();
        }).executeAll();
    }

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        await this.taskScheduler.add(async () => {
            if (event.isPinned) {
                this.addToPinnedTabs(event.tabId);
            } else {
                this.removeFromPinnedTabs(event.tabId);
            }

            this.closeContextMenus();
        }).executeAll();
    }

    private addToPinnedTabs(openedTabId: string) {
        const openedTabsWorkspace = this.workspaceMap.get(BuiltinWorkspaces.OPENED_TABS);
        const existingTab = openedTabsWorkspace.getTab(openedTabId);

        if (existingTab) {
            const pinnedTabsWorkspace = this.pinnedTabList;
            existingTab.markAsPinned();

            openedTabsWorkspace.removeTab(openedTabId);
            pinnedTabsWorkspace.addTab(existingTab);
        }
    }

    private removeFromPinnedTabs(openedTabId: string) {
        const pinnedTabsWorkspace = this.workspaceMap.get(BuiltinWorkspaces.PINNED_TABS);
        const existingTab = pinnedTabsWorkspace.getTab(openedTabId);

        if (existingTab) {
            const openedTabsWorkspace = this.workspaceMap.get(BuiltinWorkspaces.OPENED_TABS);
            existingTab.markAsNotPinned();

            pinnedTabsWorkspace.removeTab(openedTabId);
            openedTabsWorkspace.addTab(existingTab);
        }
    }

    async onTabTitleUpdate(event: OpenedTabTitleUpdated) {
        await this.taskScheduler.add(async () => {
            if (await this.tabFilter.isTabSatisfiesFilter(event.tabId)) {
                this.unfilterTabOnAllWorkspaces(event.tabId);
            } else {
                this.filterTabOnAllWorkspaces(event.tabId);
            }
        }).executeAll();
    }

    async onTabUrlUpdate(event: OpenedTabUrlUpdated) {
        await this.taskScheduler.add(async () => {
            if (await this.tabFilter.isTabSatisfiesFilter(event.tabId)) {
                this.unfilterTabOnAllWorkspaces(event.tabId);
            } else {
                this.filterTabOnAllWorkspaces(event.tabId);
            }
        }).executeAll();
    }

    async onCloseTabOnMiddleClickConfigure(event: CloseTabOnMiddleClickConfigured) {
        await this.taskScheduler.add(async () => {
            this.setCloseTabOnMiddleClickStatus(event.closeTabOnMiddleClick);
        }).executeAll();
    }

    async onShowCloseButtonOnTabHoverConfigure(event: ShowCloseButtonOnTabHoverConfigured) {
        await this.taskScheduler.add(async () => {
            this.setShowCloseButtonOnHoverStatus(event.showCloseButton);
        }).executeAll();
    }

    async onShowTabTitleOnSeveralLinesConfigure(event: ShowTabTitleOnSeveralLinesConfigured) {
        await this.taskScheduler.add(async () => {
            this.setShowTabTitleOnSeveralLinesStatus(event.showTabTitleOnSeveralLines);
        }).executeAll();
    }

    async onShowTabUrlOnSeveralLinesConfigure(event: ShowTabUrlOnSeveralLinesConfigured) {
        await this.taskScheduler.add(async () => {
            this.setShowTabUrlOnSeveralLinesStatus(event.showTabUrlOnSeveralLines);
        }).executeAll();
    }

    async onTabAddressToShowConfigure(event: TabAddressToShowConfigured) {
        await this.taskScheduler.add(async () => {
            this.setTabAddressToShow(event.tabAddressToShow);
        }).executeAll();
    }

    async queryCurrentWorkspaceSelectedTabs(query: GetCurrentWorkspaceSelectedTabs): Promise<string[]> {
        return this.workspaceInUse.getSelectedTabIdList().concat(this.pinnedTabList.getSelectedTabIdList());
    }

    async markTabsAsBeingMoved(command: MarkTabsAsBeingMoved) {
        this.containerElement.classList.add('move-mode');
        this.workspaceInUse.markTabsAsBeingMoved(command.tabIdList);
        this.pinnedTabList.markTabsAsBeingMoved(command.tabIdList);
    }

    async markAllTabsAsNotBeingMoved(command: MarkAllTabsAsNotBeingMoved) {
        await this.taskScheduler.add(async () => {
            this.cancelMoveMode();
        }).executeAll();
    }

    private cancelMoveMode() {
        this.containerElement.classList.remove('move-mode');
        this.workspaceInUse.markAllTabsAsNotBeingMoved();
        this.pinnedTabList.markAllTabsAsNotBeingMoved();
    }

    async moveTabsMarkedAsBeingMovedAboveTab(command: MoveTabsMarkedAsBeingMovedAboveTab) {
        await this.taskScheduler.add(async () => {
            const tabIdListToMove = this.workspaceInUse.getBeingMovedTabIdList().concat(this.pinnedTabList.getBeingMovedTabIdList());
            this.cancelMoveMode();
            const targetTab = this.workspaceInUse.getTab(command.tabId) || this.pinnedTabList.getTab(command.tabId);

            this.commandBus.handle(new MoveOpenedTabs(tabIdListToMove, targetTab.getPosition()));
        }).executeAll();
    }

    async moveTabsMarkedAsBeingMovedBelowAll(command: MoveTabsMarkedAsBeingMovedBelowAll) {
        await this.taskScheduler.add(async () => {
            const tabIdListToMove = this.workspaceInUse.getBeingMovedTabIdList().concat(this.pinnedTabList.getBeingMovedTabIdList());
            this.cancelMoveMode();
            const targetPosition = -1;

            this.commandBus.handle(new MoveOpenedTabs(tabIdListToMove, targetPosition));
        }).executeAll();
    }

    // TODO onWorkspaceDelete() => call TabList.shutdown()
}

export class TabsViewFactory {
    constructor(
        private tabListFactory: TabListFactory,
        private tabFilterFactory: TabFilterfactory,
        private newTabButtonFactory: NewTabButtonFactory,
        private selectedTabsActionsFactory: SelectedTabsActionsFactory,
        private taskSchedulerFactory: TaskSchedulerFactory,
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
    ) {
    }

    create(containerElement: HTMLElement) {
        return new TabsView(
            containerElement,
            this.tabListFactory,
            this.tabFilterFactory,
            this.newTabButtonFactory,
            this.selectedTabsActionsFactory,
            this.commandBus,
            this.eventBus,
            this.queryBus,
            this.taskSchedulerFactory.create(),
        );
    }
}
