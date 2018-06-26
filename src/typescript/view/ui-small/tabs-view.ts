import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { OpenedTabPinStateUpdated } from '../../tab/opened-tab/event/opened-tab-pin-state-updated';
import { OpenedTabTitleUpdated } from '../../tab/opened-tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../../tab/opened-tab/event/opened-tab-url-updated';
import { TabOpened } from '../../tab/opened-tab/event/tab-opened';
import { OpenedTab } from '../../tab/opened-tab/opened-tab';
import { GetOpenedTabs } from '../../tab/opened-tab/query';
import { Counter } from '../../utils/counter';
import { TaskScheduler, TaskSchedulerFactory } from '../../utils/task-scheduler';
import { Checkbox } from '../components/checkbox';
import { CurrentWorkspace } from './tabs-view/current-workspace';
import { TabFilter, TabFilterfactory } from './tabs-view/tab-filter';
import { TabList, TabListFactory } from './tabs-view/tab-list';

enum BuiltinWorkspaces {
    OPENED_TABS = 'opened-tabs',
    PINNED_TABS = 'pinned-tabs',
}

export class TabsView {
    private tabFilter: TabFilter;
    private generalTabSelector: Checkbox;
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
        private tabFilterFactory: TabFilterfactory,
        eventBus: EventBus,
        private queryBus: QueryBus,
        private taskScheduler: TaskScheduler,
    ) {
        this.tabFilter = this.tabFilterFactory.create(containerElement.querySelector('.filter'));
        this.generalTabSelector = new Checkbox(containerElement.querySelector('.general-tab-selector'), 'general-tab-selector');
        this.unpinnedWorkspacesContainerElement = containerElement.querySelector('.unpinned-tabs');
        this.currentWorkspaceIndicatorContainerElement = containerElement.querySelector('.current-workspace');

        this.createOpenedTabWorkspace().then(() => {
            this.enableWorkspace(BuiltinWorkspaces.OPENED_TABS);

            eventBus.subscribe(TabOpened, this.onTabOpen, this);
            eventBus.subscribe(OpenedTabTitleUpdated, this.onTabTitleUpdate, this);
            eventBus.subscribe(OpenedTabUrlUpdated, this.onTabUrlUpdate, this);
            eventBus.subscribe(OpenedTabPinStateUpdated, this.onTabPinStateUpdate, this);

            this.tabFilter.observeFilterResultRetrieval(this.onTabFilterResultRetrieve.bind(this));
            this.tabFilter.observeFilterClear(this.onTabFilterClear.bind(this));
            this.generalTabSelector.observeStateChange(this.onGeneralTabSelectorStateChange.bind(this));
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

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        await this.taskScheduler.add(async () => {
            if (event.isPinned) {
                this.addToPinnedTabs(event.tabId);
            } else {
                this.removeFromPinnedTabs(event.tabId);
            }
        }).executeAll();
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

    private addToPinnedTabs(openedTabId: string) {
        const openedTabsWorkspace = this.workspaceMap.get(BuiltinWorkspaces.OPENED_TABS);
        const existingTab = openedTabsWorkspace.getTab(openedTabId);

        if (existingTab) {
            const pinnedTabsWorkspace = this.workspaceMap.get(BuiltinWorkspaces.PINNED_TABS);
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
        } else {
            this.workspaceInUse.unselectAllTabs();
            this.pinnedTabList.unselectAllTabs();
        }
    }

    private onNumberOfSelectedTabsChange(workspaceId: string) {
        if (BuiltinWorkspaces.PINNED_TABS !== workspaceId && this.workspaceInUse.workspaceId !== workspaceId) {
            return;
        }

        const totalNumberOfSelectedTabs = this.pinnedTabList.getNumberOfSelectedTabs() + this.workspaceInUse.getNumberOfSelectedTabs();

        if (0 === totalNumberOfSelectedTabs) {
            this.generalTabSelector.markAsUnchecked();
        } else {
            this.generalTabSelector.markAsChecked();
        }
    }

    // TODO onWorkspaceDelete() => call TabList.shutdown()
}

export class TabsViewFactory {
    constructor(
        private tabListFactory: TabListFactory,
        private tabFilterFactory: TabFilterfactory,
        private taskSchedulerFactory: TaskSchedulerFactory,
        private eventBus: EventBus,
        private queryBus: QueryBus,
    ) {
    }

    create(containerElement: HTMLElement) {
        return new TabsView(containerElement, this.tabListFactory, this.tabFilterFactory, this.eventBus, this.queryBus, this.taskSchedulerFactory.create());
    }
}
