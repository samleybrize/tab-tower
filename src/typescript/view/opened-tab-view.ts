import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { CloseTab } from '../tab/command/close-tab';
import { DuplicateTab } from '../tab/command/duplicate-tab';
import { FocusTab } from '../tab/command/focus-tab';
import { FollowTab } from '../tab/command/follow-tab';
import { MoveOpenedTabs } from '../tab/command/move-opened-tabs';
import { MuteTab } from '../tab/command/mute-tab';
import { PinTab } from '../tab/command/pin-tab';
import { ReloadTab } from '../tab/command/reload-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { UnmuteTab } from '../tab/command/unmute-tab';
import { UnpinTab } from '../tab/command/unpin-tab';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabAudibleStateUpdated } from '../tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabFaviconUrlUpdated } from '../tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../tab/event/opened-tab-focused';
import { OpenedTabMoved } from '../tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../tab/event/opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from '../tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabOpened } from '../tab/event/tab-opened';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { TabOpenState } from '../tab/opened-tab/tab-open-state';
import { GetTabAssociationByOpenId } from '../tab/query/get-tab-association-by-open-id';
import { GetTabAssociationsWithOpenState } from '../tab/query/get-tab-associations-with-open-state';
import { TabAssociation } from '../tab/tab-association/tab-association';
import { IndicatorManipulator, IndicatorType } from './component/indicator-manipulator';
import { MoreActionType, MoreMenu, MoreMenuManipulator } from './component/more-menu-manipulator';
import { TabFilterApplier } from './component/tab-filter-applier';
import { MoveAboveOthersClickCallback, MoveBelowClickCallback, TabMoveAction } from './component/tab-move-action';
import { TabTitleClickCallback, TabTitleManipulator } from './component/tab-title-manipulator';
import { TabCounter } from './tab-counter';
import { TabView } from './tab-view';

export class OpenedTabView {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private tabCounter: TabCounter,
        private tabView: TabView,
        private indicatorManipulator: IndicatorManipulator,
        private moreMenuManipulator: MoreMenuManipulator,
        private tabFilterApplier: TabFilterApplier,
        private tabMoveAction: TabMoveAction,
        private tabTitleManipulator: TabTitleManipulator,
    ) {
    }

    async init() {
        const selectionTabMoreMenu = this.createSelectionTabMoreMenu();
        const moveAboveOthersCallback: MoveAboveOthersClickCallback = () => {
            const tabIdList = this.getTabIdListToMove();
            this.tabMoveAction.disableMoveMode();

            this.commandBus.handle(new MoveOpenedTabs(tabIdList, 0));
        };
        this.tabView.init(selectionTabMoreMenu, moveAboveOthersCallback);

        const tabList = await this.queryBus.query(new GetTabAssociationsWithOpenState());
        let numberOfOpenedTabs = 0;

        for (const tab of tabList) {
            if (!tab.openState) {
                continue;
            }

            const row = this.createTabRow(tab.openState, this.isTabFollowed(tab));
            this.tabView.tbodyElement.appendChild(row);
            this.moreMenuManipulator.initMoreDropdown(row);
            numberOfOpenedTabs++;
        }

        await this.tabView.markAsInitialized();
        this.tabCounter.setNumberOfOpenedTabs(numberOfOpenedTabs);
        this.tabFilterApplier.applyFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
    }

    private getTabIdListToMove() {
        const tabRowsToMove = this.tabMoveAction.getTabRowsToMove();

        if (null == tabRowsToMove) {
            return [];
        }

        const tabIdList: number[] = [];

        for (const tabRowToMove of tabRowsToMove) {
            tabIdList.push(+tabRowToMove.getAttribute('data-tab-id'));
        }

        return tabIdList;
    }

    private isTabFollowed(tab: TabAssociation) {
        return !!tab.followState;
    }

    private createTabRow(tabOpenState: TabOpenState, isFollowed: boolean): HTMLElement {
        const indicatorList = this.createIndicatorList();
        const moreMenu = this.createTabMoreMenu(tabOpenState);

        const titleClickCallback: TabTitleClickCallback = (clickedElement) => {
            const row = clickedElement.closest('tr');
            const tabId = +row.getAttribute('data-tab-id');

            if (tabId) {
                this.commandBus.handle(new FocusTab(tabId));
            }
        };
        const moveBelowCallback: MoveBelowClickCallback = (clickedButton) => {
            const targetRow = clickedButton.closest('tr');
            const targetRowIndex = +targetRow.getAttribute('data-index');

            const isTargetRowBeingMoved = targetRow.classList.contains('beingMoved');
            const targetIndex = isTargetRowBeingMoved ? targetRowIndex : targetRowIndex + 1;
            const tabIdList = this.getTabIdListToMove();

            this.commandBus.handle(new MoveOpenedTabs(tabIdList, targetIndex));

            this.tabMoveAction.disableMoveMode();
        };

        const tabRow = this.tabView.createTabRow(
            `opened-tab-${tabOpenState.id}`,
            tabOpenState.title,
            tabOpenState.url,
            tabOpenState.faviconUrl,
            tabOpenState.isAudible,
            tabOpenState.isInReaderMode,
            tabOpenState.isAudioMuted,
            tabOpenState.isPinned,
            tabOpenState.isIncognito,
            tabOpenState.lastAccess,
            indicatorList,
            moreMenu,
            titleClickCallback,
            moveBelowCallback,
        );

        tabRow.row.setAttribute('data-tab-id', '' + tabOpenState.id);

        this.updateFollowState(tabRow.row, isFollowed);
        this.updateTabIndex(tabRow.row, tabOpenState.index);
        this.updateTabUrl(tabRow.row, tabOpenState.url, tabOpenState.isPrivileged, tabOpenState.isIgnored);
        this.tabTitleManipulator.updateTitleTooltip(tabRow.row, 'Go to tab');

        return tabRow.row;
    }

    private createIndicatorList() {
        const indicatorList = [
            this.indicatorManipulator.create(IndicatorType.Audible),
            this.indicatorManipulator.create(IndicatorType.Muted),
            this.indicatorManipulator.create(IndicatorType.Followed),
            this.indicatorManipulator.create(IndicatorType.Pinned),
            this.indicatorManipulator.create(IndicatorType.ReaderView),
            this.indicatorManipulator.create(IndicatorType.Incognito),
        ];

        return indicatorList;
    }

    private createSelectionTabMoreMenu() {
        const moreMenu: MoreMenu = {};
        moreMenu[MoreActionType.Follow] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Follow);
        moreMenu[MoreActionType.Pin] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Pin);
        moreMenu[MoreActionType.Unpin] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Unpin);
        moreMenu[MoreActionType.Mute] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Mute);
        moreMenu[MoreActionType.Unmute] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Unmute);
        moreMenu[MoreActionType.Move] = this.tabView.moveSelectedTabsAction.bind(this.tabView);
        moreMenu[MoreActionType.Duplicate] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Duplicate);
        moreMenu[MoreActionType.Reload] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Reload);
        moreMenu[MoreActionType.Separator] = null;
        moreMenu[MoreActionType.Close] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Close);
        moreMenu[MoreActionType.Unfollow] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Unfollow);

        return moreMenu;
    }

    private createTabMoreMenu(tabOpenState: TabOpenState) {
        const moreMenu: MoreMenu = {};
        moreMenu[MoreActionType.Follow] = this.followTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Pin] = this.pinTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Unpin] = this.unpinTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Mute] = this.muteTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Unmute] = this.unmuteTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Move] = this.tabView.moveTabAction.bind(this);
        moreMenu[MoreActionType.Duplicate] = this.duplicateTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Reload] = this.reloadTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Separator] = null;
        moreMenu[MoreActionType.Close] = this.closeTabAction.bind(this, tabOpenState);
        moreMenu[MoreActionType.Unfollow] = this.unfollowTabAction.bind(this, tabOpenState);

        return moreMenu;
    }

    private async followTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        const row = clickedElement.closest('tr') as HTMLElement;

        if (this.moreMenuManipulator.isActionDisabled(row, MoreActionType.Follow)) {
            return;
        }

        const upToDateTab = await this.queryBus.query(new GetTabAssociationByOpenId(tabOpenState.id));
        this.commandBus.handle(new FollowTab(upToDateTab));
    }

    private async unfollowTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        const row = clickedElement.closest('tr') as HTMLElement;

        if (this.moreMenuManipulator.isActionDisabled(row, MoreActionType.Unfollow)) {
            return;
        }

        const upToDateTab = await this.queryBus.query(new GetTabAssociationByOpenId(tabOpenState.id));
        this.commandBus.handle(new UnfollowTab(upToDateTab));
    }

    private pinTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new PinTab(tabOpenState.id));
    }

    private unpinTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new UnpinTab(tabOpenState.id));
    }

    private muteTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new MuteTab(tabOpenState.id));
    }

    private unmuteTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new UnmuteTab(tabOpenState.id));
    }

    private duplicateTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new DuplicateTab(tabOpenState.id));
    }

    private reloadTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new ReloadTab(tabOpenState.id));
    }

    private closeTabAction(tabOpenState: TabOpenState, clickedElement: HTMLAnchorElement) {
        const row = clickedElement.closest('tr') as HTMLElement;

        if (this.moreMenuManipulator.isActionDisabled(row, MoreActionType.Close)) {
            return;
        }

        this.commandBus.handle(new CloseTab(tabOpenState.id));
    }

    private updateTabUrl(row: HTMLElement, url: string, isPrivileged: boolean, isIgnored: boolean) {
        this.tabTitleManipulator.updateUrl(row, url);

        if (isPrivileged || isIgnored) {
            this.moreMenuManipulator.disableAction(row, MoreActionType.Follow);
            this.moreMenuManipulator.disableAction(row, MoreActionType.Unfollow);
        } else {
            this.moreMenuManipulator.enableAction(row, MoreActionType.Follow);
            this.moreMenuManipulator.enableAction(row, MoreActionType.Unfollow);
        }

        if (isIgnored) {
            this.moreMenuManipulator.disableAction(row, MoreActionType.Close);
        } else {
            this.moreMenuManipulator.enableAction(row, MoreActionType.Close);
        }
    }

    private updateTabIndex(row: HTMLElement, index: number) {
        row.setAttribute('data-index', '' + index);
    }

    private updateFollowState(row: HTMLElement, isFollowed: boolean) {
        this.indicatorManipulator.changeState(row, IndicatorType.Followed, isFollowed);

        if (isFollowed) {
            this.moreMenuManipulator.hideAction(row, MoreActionType.Follow);
            this.moreMenuManipulator.showAction(row, MoreActionType.Unfollow);
        } else {
            this.moreMenuManipulator.showAction(row, MoreActionType.Follow);
            this.moreMenuManipulator.hideAction(row, MoreActionType.Unfollow);
        }
    }

    show() {
        this.tabView.show();
    }

    hide() {
        this.tabView.hide();
    }

    // TODO merge "onTabOpen" with "handleTabOpen"
    async onTabOpen(event: TabOpened) {
        this.tabView.addPendingTask(this.handleTabOpen.bind(this, event));
    }

    private async handleTabOpen(event: TabOpened) {
        const existingTabRow = await this.getTabRowByTabId(event.tabOpenState.id);

        if (null !== existingTabRow) {
            return;
        }

        const rowToInsert = this.createTabRow(event.tabOpenState, false);

        if (0 == event.tabOpenState.index) {
            this.tabView.noTabRow.insertAdjacentElement('afterend', rowToInsert);
        } else {
            this.insertRowAtIndex(rowToInsert, event.tabOpenState.index);
        }

        this.moreMenuManipulator.initMoreDropdown(rowToInsert);
        this.tabFilterApplier.applyFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
        this.tabCounter.incrementNumberOfOpenedTabs();
    }

    private insertRowAtIndex(rowToInsert: HTMLElement, insertAtIndex: number) {
        const existingRowList = Array.from(this.tabView.tbodyElement.querySelectorAll('tr')).reverse();

        for (const existingRow of existingRowList) {
            const indexAttribute = existingRow.getAttribute('data-index');
            const existingRowIndex = +indexAttribute;

            if (null !== indexAttribute && existingRowIndex < insertAtIndex) {
                existingRow.insertAdjacentElement('afterend', rowToInsert);

                return;
            }
        }

        this.tabView.tbodyElement.appendChild(rowToInsert);
    }

    private getTabRowByTabId(tabId: number): HTMLTableRowElement {
        return this.tabView.tbodyElement.querySelector(`tr[data-tab-id="${tabId}"]`);
    }

    async onTabClose(event: TabClosed) {
        this.tabView.addPendingTask(this.handleTabClose.bind(this, event));
    }

    private async handleTabClose(event: TabClosed) {
        const openedTabRow = this.getTabRowByTabId(event.closedTab.id);

        if (openedTabRow) {
            jQuery(openedTabRow).find('[data-tooltip]').tooltip('remove');
            openedTabRow.remove();
            this.tabView.showOrHideSelectionActionsDependingOfSelectedTabs();
            this.tabView.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfOpenedTabs();
        }
    }

    async onOpenTabMove(event: OpenedTabMoved) {
        this.tabView.addPendingTask(this.handleOpenTabMove.bind(this, event));
    }

    private async handleOpenTabMove(event: OpenedTabMoved) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.insertRowAtIndex(tabRow, event.tabOpenState.index);
            this.updateTabIndex(tabRow, event.tabOpenState.index);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabFaviconUrlUpdate.bind(this, event));
    }

    private async handleOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabTitleManipulator.updateFavicon(tabRow, event.tabOpenState.faviconUrl);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabTitleUpdate.bind(this, event));
    }

    private async handleOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabTitleManipulator.updateTitle(tabRow, event.tabOpenState.title);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabUrlUpdate.bind(this, event));
    }

    private async handleOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url, event.tabOpenState.isPrivileged, event.tabOpenState.isIgnored);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabReaderModeStateUpdate.bind(this, event));
    }

    private async handleOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabAudibleStateUpdate.bind(this, event));
    }

    private async handleOpenTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabAudibleIndicator(tabRow, event.tabOpenState.isAudible);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabAudioMuteStateUpdate.bind(this, event));
    }

    private async handleOpenTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabAudioMuteState(tabRow, event.tabOpenState.isAudioMuted);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabPinStateUpdate.bind(this, event));
    }

    private async handleOpenTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabPinState(tabRow, event.tabOpenState.isPinned);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onTabFollow(event: TabFollowed) {
        this.tabView.addPendingTask(this.handleTabFollow.bind(this, event));
    }

    private async handleTabFollow(event: TabFollowed) {
        const tabRow = this.getTabRowByTabId(event.tab.openState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, true);
        }
    }

    async onTabUnfollow(event: TabUnfollowed) {
        this.tabView.addPendingTask(this.handleTabUnfollow.bind(this, event));
    }

    private async handleTabUnfollow(event: TabUnfollowed) {
        const tabRow = this.getTabRowByTabId(event.openState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, false);
        }
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        this.tabView.addPendingTask(this.handleAssociateOpenedTabToFollowedTab.bind(this, event));
    }

    private async handleAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, true);
        }
    }

    async onTabFocus(event: OpenedTabFocused) {
        this.tabView.addPendingTask(this.handleTabFocus.bind(this, event));
    }

    async handleTabFocus(event: OpenedTabFocused) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onTabFilterRequest(event: TabFilterRequested) {
        this.tabFilterApplier.setFilterTerms(event.filterTerms);
        this.tabFilterApplier.applyFilter();
    }
}
