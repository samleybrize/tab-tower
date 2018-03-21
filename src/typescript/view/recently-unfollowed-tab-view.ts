import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { DeleteRecentlyUnfollowedTab } from '../tab/command/delete-recently-unfollowed-tab';
import { RestoreRecentlyUnfollowedTab } from '../tab/command/restore-recently-unfollowed-tab';
import { RecentlyUnfollowedTabAdded } from '../tab/event/recently-unfollowed-tab-added';
import { RecentlyUnfollowedTabDeleted } from '../tab/event/recently-unfollowed-tab-deleted';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';
import { GetRecentlyUnfollowedTabs } from '../tab/query/get-recently-unfollowed-tabs';
import { RecentlyUnfollowedTab } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab';
import { MoreActionType, MoreMenu, MoreMenuManipulator } from './component/more-menu-manipulator';
import { TabFilterApplier } from './component/tab-filter-applier';
import { TabCounter } from './tab-counter';
import { TabView } from './tab-view';

export class RecentlyUnfollowedTabView {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private tabCounter: TabCounter,
        private tabView: TabView,
        private moreMenuManipulator: MoreMenuManipulator,
        private tabFilterApplier: TabFilterApplier,
    ) {
    }

    async init() {
        const selectionTabMoreMenu = this.createSelectionTabMoreMenu();
        this.tabView.init(selectionTabMoreMenu, null);

        const tabList = await this.queryBus.query(new GetRecentlyUnfollowedTabs());
        this.sortTabListByUnfollowDateDesc(tabList);
        let numberOfTabs = 0;

        for (const tab of tabList) {
            const row = this.createTabRow(tab);
            this.tabView.tbodyElement.appendChild(row);
            this.moreMenuManipulator.initMoreDropdown(row);
            numberOfTabs++;
        }

        await this.tabView.markAsInitialized();
        this.tabCounter.setNumberOfRecentlyUnfollowedTabs(numberOfTabs);
        this.tabFilterApplier.applyFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
    }

    private sortTabListByUnfollowDateDesc(tabList: RecentlyUnfollowedTab[]) {
        tabList.sort((a, b) => {
            if (a.unfollowedAt.getTime() > b.unfollowedAt.getTime()) {
                return -1;
            } else if (a.unfollowedAt.getTime() < b.unfollowedAt.getTime()) {
                return 1;
            }

            return 0;
        });
    }

    private createTabRow(tab: RecentlyUnfollowedTab): HTMLElement {
        const moreMenu = this.createTabMoreMenu(tab);

        const tabRow = this.tabView.createTabRow(
            `recently-unfollowed-tab-${tab.followState.id}`,
            tab.followState.title,
            tab.followState.url,
            tab.followState.faviconUrl,
            false,
            false,
            false,
            false,
            false,
            tab.followState.openLastAccess,
            [],
            moreMenu,
            null,
            null,
        );

        tabRow.row.setAttribute('data-follow-id', '' + tab.followState.id);

        return tabRow.row;
    }

    private createSelectionTabMoreMenu() {
        const moreMenu: MoreMenu = {};
        moreMenu[MoreActionType.RestoreRecentlyUnfollowedTab] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.RestoreRecentlyUnfollowedTab);
        moreMenu[MoreActionType.Separator] = null;
        moreMenu[MoreActionType.Delete] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Delete);

        return moreMenu;
    }

    private createTabMoreMenu(tab: RecentlyUnfollowedTab) {
        const moreMenu: MoreMenu = {};
        moreMenu[MoreActionType.RestoreRecentlyUnfollowedTab] = this.restoreTabAction.bind(this, tab);
        moreMenu[MoreActionType.Separator] = null;
        moreMenu[MoreActionType.Delete] = this.deleteTabAction.bind(this, tab);

        return moreMenu;
    }

    private restoreTabAction(tab: RecentlyUnfollowedTab, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new RestoreRecentlyUnfollowedTab(tab.followState.id));
    }

    private deleteTabAction(tab: RecentlyUnfollowedTab, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new DeleteRecentlyUnfollowedTab(tab.followState.id));
    }

    show() {
        this.tabView.show();
    }

    hide() {
        this.tabView.hide();
    }

    private getTabRowByFollowId(followId: string): HTMLTableRowElement {
        return this.tabView.tbodyElement.querySelector(`tr[data-follow-id="${followId}"]`);
    }

    async onRecentlyUnfollowedTabAdd(event: RecentlyUnfollowedTabAdded) {
        this.tabView.addPendingTask(this.handleRecentlyUnfollowedTabAdd.bind(this, event));
    }

    private async handleRecentlyUnfollowedTabAdd(event: RecentlyUnfollowedTabAdded) {
        const row = this.createTabRow(event.recentlyUnfollowedTab);
        this.insertRowAtFirstPosition(row);

        this.tabView.hideNoTabRow();
        this.moreMenuManipulator.initMoreDropdown(row);
        this.tabFilterApplier.applyFilter();
        this.tabCounter.incrementNumberOfRecentlyUnfollowedTabs();
    }

    private insertRowAtFirstPosition(rowToInsert: HTMLElement) {
        const existingRowList = Array.from<HTMLElement>(this.tabView.tbodyElement.querySelectorAll('tr:not(.noTabRow)')).reverse();
        const firstRow = existingRowList.pop();
        this.insertRowBeforeRow(rowToInsert, firstRow);
    }

    private insertRowBeforeRow(rowToInsert: HTMLElement, referenceRow: HTMLElement) {
        if (referenceRow) {
            referenceRow.insertAdjacentElement('beforebegin', rowToInsert);
        } else {
            this.tabView.tbodyElement.appendChild(rowToInsert);
        }
    }

    async onRecentlyUnfollowedTabDelete(event: RecentlyUnfollowedTabDeleted) {
        this.tabView.addPendingTask(this.handleRecentlyUnfollowedTabDelete.bind(this, event));
    }

    private async handleRecentlyUnfollowedTabDelete(event: RecentlyUnfollowedTabDeleted) {
        const recentlyUnfollowedTabRow = this.getTabRowByFollowId(event.recentlyUnfollowedTab.followState.id);

        if (recentlyUnfollowedTabRow) {
            jQuery(recentlyUnfollowedTabRow).find('[data-tooltip]').tooltip('remove');
            recentlyUnfollowedTabRow.remove();
            this.tabView.showOrHideSelectionActionsDependingOfSelectedTabs();
            this.tabView.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfRecentlyUnfollowedTabs();
        }
    }

    async onTabFilterRequest(event: TabFilterRequested) {
        this.tabFilterApplier.setFilterTerms(event.filterTerms);
        this.tabFilterApplier.applyFilter();
    }
}
