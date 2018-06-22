import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { OpenedTabPinStateUpdated } from '../../tab/opened-tab/event/opened-tab-pin-state-updated';
import { OpenedTabTitleUpdated } from '../../tab/opened-tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../../tab/opened-tab/event/opened-tab-url-updated';
import { TabOpened } from '../../tab/opened-tab/event/tab-opened';
import { OpenedTab } from '../../tab/opened-tab/opened-tab';
import { GetOpenedTabs } from '../../tab/opened-tab/query';
import { TaskScheduler, TaskSchedulerFactory } from '../../utils/task-scheduler';
import { CurrentWorkspace } from './tabs-view/current-workspace';
import { TabFilter, TabFilterfactory } from './tabs-view/tab-filter';
import { TabList, TabListFactory } from './tabs-view/tab-list';

enum BuiltinWorkspaces {
    OPENED_TABS = 'opened-tabs',
    PINNED_TABS = 'pinned-tabs',
}

export class TabsView {
    private currentWorkspace: CurrentWorkspace;
    private tabFilter: TabFilter;
    private pinnedTabList: TabList;
    private workspaceMap = new Map<string, TabList>();
    private workspaceList: TabList[] = [];
    private workspaceContainerElement: HTMLElement;

    constructor(
        private containerElement: HTMLElement,
        private tabListFactory: TabListFactory,
        private tabFilterFactory: TabFilterfactory,
        eventBus: EventBus,
        private queryBus: QueryBus,
        private taskScheduler: TaskScheduler,
    ) {
        this.tabFilter = this.tabFilterFactory.create(containerElement.querySelector('.filter'));
        this.workspaceContainerElement = containerElement.querySelector('.unpinned-tabs');
        this.currentWorkspace = new CurrentWorkspace(containerElement.querySelector('.current-workspace'));

        this.createOpenedTabWorkspace();

        eventBus.subscribe(TabOpened, this.onTabOpen, this);
        eventBus.subscribe(OpenedTabTitleUpdated, this.onTabTitleUpdate, this);
        eventBus.subscribe(OpenedTabUrlUpdated, this.onTabUrlUpdate, this);
        eventBus.subscribe(OpenedTabPinStateUpdated, this.onTabPinStateUpdate, this);

        this.tabFilter.observeFilterResultRetrieval(this.onTabFilterResultRetrieve.bind(this));
        this.tabFilter.observeFilterClear(this.onTabFilterClear.bind(this));
    }

    private async createOpenedTabWorkspace() {
        const openedTabWorkspace = this.createWorkspace(BuiltinWorkspaces.OPENED_TABS);
        this.insertWorkspace(openedTabWorkspace);

        this.pinnedTabList = this.createWorkspace(BuiltinWorkspaces.PINNED_TABS, this.containerElement.querySelector('.pinned-tabs'));

        const openedTabList = await this.queryBus.query(new GetOpenedTabs());
        const pinnedTabList: OpenedTab[] = [];

        for (const openedTab of openedTabList) {
            if (openedTab.isPinned) {
                pinnedTabList.push(openedTab);
            }
        }

        await this.pinnedTabList.init(pinnedTabList);
        await openedTabWorkspace.init(openedTabList);
    }

    private createWorkspace(workspaceId: string, workspaceContainerElement?: HTMLElement) {
        if (!workspaceContainerElement) {
            const random = Math.random();
            workspaceContainerElement = document.createElement('div');
            workspaceContainerElement.id = `tabs-view-workspace-container-${workspaceId}-${random}`;
        }

        const workspace = this.tabListFactory.create(workspaceId, workspaceContainerElement, this.taskScheduler);
        this.workspaceMap.set(workspaceId, workspace);
        this.workspaceList.push(workspace);

        workspaceContainerElement.setAttribute('data-workspace-id', workspaceId);

        return workspace;
    }

    private insertWorkspace(workspace: TabList) {
        this.workspaceContainerElement.insertAdjacentElement('beforeend', workspace.containerElement);
    }

    async onTabOpen(event: TabOpened) {
        await this.taskScheduler.add(async () => {
            if (event.tab.isPinned) {
                this.workspaceMap.get(BuiltinWorkspaces.PINNED_TABS).addTab(event.tab);
            }

            this.workspaceMap.get(BuiltinWorkspaces.OPENED_TABS).addTab(event.tab);

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
            const newTab = existingTab.clone(openedTabId);
            newTab.markAsPinned();

            pinnedTabsWorkspace.addTab(newTab);
        }
    }

    private removeFromPinnedTabs(openedTabId: string) {
        const pinnedTabsWorkspace = this.workspaceMap.get(BuiltinWorkspaces.PINNED_TABS);
        pinnedTabsWorkspace.removeTab(openedTabId);
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
