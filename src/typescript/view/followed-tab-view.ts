import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { CloseTab } from '../tab/command/close-tab';
import { DuplicateTab } from '../tab/command/duplicate-tab';
import { FocusTab } from '../tab/command/focus-tab';
import { MoveFollowedTabs } from '../tab/command/move-followed-tabs';
import { MuteTab } from '../tab/command/mute-tab';
import { PinTab } from '../tab/command/pin-tab';
import { ReloadTab } from '../tab/command/reload-tab';
import { RestoreFollowedTab } from '../tab/command/restore-followed-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { UnmuteTab } from '../tab/command/unmute-tab';
import { UnpinTab } from '../tab/command/unpin-tab';
import { FollowedTabMoved } from '../tab/event/followed-tab-moved';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabAudibleStateUpdated } from '../tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabFaviconUrlUpdated } from '../tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../tab/event/opened-tab-focused';
import { OpenedTabPinStateUpdated } from '../tab/event/opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from '../tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { GetTabAssociationByFollowId } from '../tab/query/get-tab-association-by-follow-id';
import { GetTabAssociationsWithFollowState } from '../tab/query/get-tab-associations-with-follow-state';
import { TabAssociation } from '../tab/tab-association/tab-association';
import { IndicatorManipulator, IndicatorType } from './component/indicator-manipulator';
import { MoreActionType, MoreMenu, MoreMenuManipulator } from './component/more-menu-manipulator';
import { TabFilterApplier } from './component/tab-filter-applier';
import { MoveAboveOthersClickCallback, MoveBelowClickCallback, TabMoveAction } from './component/tab-move-action';
import { TabSelectorManipulator } from './component/tab-selector-manipulator';
import { TabTitleClickCallback, TabTitleManipulator } from './component/tab-title-manipulator';
import { TabCounter } from './tab-counter';
import { TabView } from './tab-view';

export class FollowedTabView {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private tabCounter: TabCounter,
        private tabView: TabView,
        private indicatorManipulator: IndicatorManipulator,
        private moreMenuManipulator: MoreMenuManipulator,
        private tabFilterApplier: TabFilterApplier,
        private tabMoveAction: TabMoveAction,
        private tabSelectorManipulator: TabSelectorManipulator,
        private tabTitleManipulator: TabTitleManipulator,
    ) {
    }

    async init() {
        const selectionTabMoreMenu = this.createSelectionTabMoreMenu();
        const moveAboveOthersCallback: MoveAboveOthersClickCallback = () => {
            const tabIdList = this.getTabIdListToMove();
            this.tabMoveAction.disableMoveMode();

            const firstRow = this.tabView.tbodyElement.querySelector('tr:not(.noTabRow)');
            const insertBeforeFollowId = firstRow ? firstRow.getAttribute('data-follow-id') : null;
            this.commandBus.handle(new MoveFollowedTabs(tabIdList, null, insertBeforeFollowId));
        };
        this.tabView.init(selectionTabMoreMenu, moveAboveOthersCallback);

        const tabList = await this.queryBus.query(new GetTabAssociationsWithFollowState());
        this.sortTabListByFollowWeight(tabList);
        let numberOfFollowedTabs = 0;

        for (const tab of tabList) {
            if (!tab.followState) {
                continue;
            }

            const row = this.createTabRow(tab);
            this.tabView.tbodyElement.appendChild(row);
            this.moreMenuManipulator.initMoreDropdown(row);
            numberOfFollowedTabs++;
        }

        await this.tabView.markAsInitialized();
        this.tabCounter.setNumberOfFollowedTabs(numberOfFollowedTabs);
        this.tabFilterApplier.applyFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
    }

    private getTabIdListToMove() {
        const tabRowsToMove = this.tabMoveAction.getTabRowsToMove();

        if (null == tabRowsToMove) {
            return [];
        }

        const tabIdList: string[] = [];

        for (const tabRowToMove of tabRowsToMove) {
            tabIdList.push(tabRowToMove.getAttribute('data-follow-id'));
        }

        return tabIdList;
    }

    private sortTabListByFollowWeight(tabList: TabAssociation[]) {
        tabList.sort((a, b) => {
            // by weight asc
            if (a.followState.weight < b.followState.weight) {
                return -1;
            } else if (a.followState.weight > b.followState.weight) {
                return 1;
            }

            return 0;
        });
    }

    private createTabRow(tab: TabAssociation): HTMLElement {
        const indicatorList = this.createIndicatorList();
        const moreMenu = this.createTabMoreMenu(tab);

        const titleClickCallback: TabTitleClickCallback = (clickedElement) => {
            const row = clickedElement.closest('tr');
            const openTabId = +row.getAttribute('data-opened-tab-id');
            const isOpeningTab = !!row.getAttribute('data-is-opening-tab');

            if (openTabId) {
                this.commandBus.handle(new FocusTab(openTabId));
            } else if (!isOpeningTab) {
                row.setAttribute('data-is-opening-tab', '1');
                this.commandBus.handle(new RestoreFollowedTab(tab.followState.id));
            }
        };
        const moveBelowCallback: MoveBelowClickCallback = (clickedButton) => {
            const moveAfterRow = clickedButton.closest('tr');
            const moveBeforeRow = moveAfterRow.nextElementSibling;
            const moveAfterFollowId = moveAfterRow ? moveAfterRow.getAttribute('data-follow-id') : null;
            const moveBeforeFollowId = moveBeforeRow ? moveBeforeRow.getAttribute('data-follow-id') : null;

            const followIdList = this.getTabIdListToMove();

            this.commandBus.handle(new MoveFollowedTabs(followIdList, moveAfterFollowId, moveBeforeFollowId));

            this.tabMoveAction.disableMoveMode();
        };

        const tabRow = this.tabView.createTabRow(
            `followed-tab-${tab.followState.id}`,
            tab.followState.title,
            tab.followState.url,
            tab.followState.faviconUrl,
            tab.openState ? tab.openState.isAudible : false,
            tab.openState ? tab.openState.isInReaderMode : false,
            tab.openState ? tab.openState.isAudioMuted : false,
            tab.openState ? tab.openState.isPinned : false,
            tab.openState ? tab.openState.isIncognito : false,
            tab.followState.openLastAccess,
            indicatorList,
            moreMenu,
            titleClickCallback,
            moveBelowCallback,
        );

        tabRow.row.setAttribute('data-follow-id', '' + tab.followState.id);

        const tabOpenId = tab.openState ? tab.openState.id : null;
        this.updateTabOpenState(tabRow.row, this.isTabOpened(tab), tabOpenId);
        this.updateTabPosition(tabRow.row, tab.followState.weight);

        return tabRow.row;
    }

    private isTabOpened(tab: TabAssociation) {
        return !!tab.openState;
    }

    private createIndicatorList() {
        const indicatorList = [
            this.indicatorManipulator.create(IndicatorType.Audible),
            this.indicatorManipulator.create(IndicatorType.Muted),
            this.indicatorManipulator.create(IndicatorType.Opened),
            this.indicatorManipulator.create(IndicatorType.Pinned),
            this.indicatorManipulator.create(IndicatorType.ReaderView),
            this.indicatorManipulator.create(IndicatorType.Incognito),
        ];

        return indicatorList;
    }

    private createSelectionTabMoreMenu() {
        const moreMenu: MoreMenu = {};
        moreMenu[MoreActionType.Pin] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Pin);
        moreMenu[MoreActionType.Unpin] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Unpin);
        moreMenu[MoreActionType.Mute] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Mute);
        moreMenu[MoreActionType.Unmute] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Unmute);
        moreMenu[MoreActionType.Move] = this.tabView.moveSelectedTabsAction.bind(this);
        moreMenu[MoreActionType.Duplicate] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Duplicate);
        moreMenu[MoreActionType.Reload] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Reload);
        moreMenu[MoreActionType.Separator] = null;
        moreMenu[MoreActionType.Close] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Close);
        moreMenu[MoreActionType.Unfollow] = this.tabView.triggerTabActionOnSelectedRows.bind(this.tabView, MoreActionType.Unfollow);

        return moreMenu;
    }

    private createTabMoreMenu(tab: TabAssociation) {
        const moreMenu: MoreMenu = {};
        moreMenu[MoreActionType.Pin] = this.pinTabAction.bind(this, tab);
        moreMenu[MoreActionType.Unpin] = this.unpinTabAction.bind(this, tab);
        moreMenu[MoreActionType.Mute] = this.muteTabAction.bind(this, tab);
        moreMenu[MoreActionType.Unmute] = this.unmuteTabAction.bind(this, tab);
        moreMenu[MoreActionType.Move] = this.tabView.moveTabAction.bind(this);
        moreMenu[MoreActionType.Duplicate] = this.duplicateTabAction.bind(this, tab);
        moreMenu[MoreActionType.Reload] = this.reloadTabAction.bind(this, tab);
        moreMenu[MoreActionType.Separator] = null;
        moreMenu[MoreActionType.Close] = this.closeTabAction.bind(this, tab);
        moreMenu[MoreActionType.Unfollow] = this.unfollowTabAction.bind(this, tab);

        return moreMenu;
    }

    private async  unfollowTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));
        this.commandBus.handle(new UnfollowTab(upToDateTab));
    }

    private async pinTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

        if (null == upToDateTab.openState) {
            return;
        }

        this.commandBus.handle(new PinTab(upToDateTab.openState.id));
    }

    private async unpinTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

        if (null == upToDateTab.openState) {
            return;
        }

        this.commandBus.handle(new UnpinTab(upToDateTab.openState.id));
    }

    private muteTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new MuteTab(tab.openState.id));
    }

    private unmuteTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new UnmuteTab(tab.openState.id));
    }

    private duplicateTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new DuplicateTab(tab.openState.id));
    }

    private reloadTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        this.commandBus.handle(new ReloadTab(tab.openState.id));
    }

    private async  closeTabAction(tab: TabAssociation, clickedElement: HTMLAnchorElement) {
        const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

        if (null == upToDateTab.openState) {
            return;
        }

        this.commandBus.handle(new CloseTab(upToDateTab.openState.id));
    }

    private updateTabOpenState(row: HTMLElement, isOpened: boolean, openTabId: number) {
        const openTabIdAttribute = openTabId ? '' + openTabId : '';
        row.setAttribute('data-opened-tab-id', '' + openTabIdAttribute);
        this.indicatorManipulator.changeState(row, IndicatorType.Opened, isOpened);

        if (isOpened) {
            this.moreMenuManipulator.showAction(row, MoreActionType.Close);
            this.moreMenuManipulator.enableAction(row, MoreActionType.Duplicate);
            this.moreMenuManipulator.enableAction(row, MoreActionType.Mute);
            this.moreMenuManipulator.enableAction(row, MoreActionType.Pin);
            this.moreMenuManipulator.enableAction(row, MoreActionType.Reload);
            this.moreMenuManipulator.enableAction(row, MoreActionType.Unmute);
            this.tabTitleManipulator.updateTitleTooltip(row, 'Go to tab');
        } else {
            this.moreMenuManipulator.hideAction(row, MoreActionType.Close);
            this.moreMenuManipulator.disableAction(row, MoreActionType.Duplicate);
            this.moreMenuManipulator.disableAction(row, MoreActionType.Mute);
            this.moreMenuManipulator.disableAction(row, MoreActionType.Pin);
            this.moreMenuManipulator.disableAction(row, MoreActionType.Reload);
            this.moreMenuManipulator.disableAction(row, MoreActionType.Unmute);
            this.tabTitleManipulator.updateTitleTooltip(row, 'Open tab');
        }
    }

    private updateTabPosition(row: HTMLElement, weight: number) {
        row.setAttribute('data-weight', '' + weight);
    }

    show() {
        this.tabView.show();
    }

    hide() {
        this.tabView.hide();
    }

    // TODO merge "onTabClose" with "handleTabClose"
    async onTabClose(event: TabClosed) {
        this.tabView.addPendingTask(this.handleTabClose.bind(this, event));
    }

    private async handleTabClose(event: TabClosed) {
        const tabRow = this.getTabRowByOpenTabId(event.closedTab.id);

        if (tabRow) {
            tabRow.removeAttribute('data-opened-tab-id');
            const followId = tabRow.getAttribute('data-follow-id');
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(followId));

            this.tabView.updateTabAudibleIndicator(tabRow, false);
            this.tabView.updateTabPinState(tabRow, false);
            this.tabTitleManipulator.updateTitle(tabRow, upToDateTab.followState.title);
            this.tabTitleManipulator.updateUrl(tabRow, upToDateTab.followState.url);
            this.tabTitleManipulator.updateFavicon(tabRow, upToDateTab.followState.faviconUrl);
            this.updateTabOpenState(tabRow, false, null);
        }
    }

    private getTabRowByOpenTabId(openTabId: number): HTMLTableRowElement {
        return this.tabView.tbodyElement.querySelector(`tr[data-opened-tab-id="${openTabId}"]`);
    }

    async onOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        this.tabView.addPendingTask(this.handleTabFaviconUrlUpdate.bind(this, event));
    }

    private async handleTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabTitleManipulator.updateFavicon(tabRow, event.tabOpenState.faviconUrl);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        this.tabView.addPendingTask(this.handleTabTitleUpdate.bind(this, event));
    }

    private async handleTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabTitleManipulator.updateTitle(tabRow, event.tabOpenState.title);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        this.tabView.addPendingTask(this.handleTabUrlUpdate.bind(this, event));
    }

    private async handleTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabTitleManipulator.updateUrl(tabRow, event.tabOpenState.url);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        this.tabView.addPendingTask(this.handleTabReaderModeStateUpdate.bind(this, event));
    }

    private async handleTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabAudibleStateUpdate.bind(this, event));
    }

    private async handleOpenTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabAudibleIndicator(tabRow, event.tabOpenState.isAudible);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabAudioMuteStateUpdate.bind(this, event));
    }

    private async handleOpenTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabAudioMuteState(tabRow, event.tabOpenState.isAudioMuted);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        this.tabView.addPendingTask(this.handleTabPinStateUpdate.bind(this, event));
    }

    private async handleTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabPinState(tabRow, event.tabOpenState.isPinned);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onTabFollow(event: TabFollowed) {
        this.tabView.addPendingTask(this.handleTabFollow.bind(this, event));
    }

    private async handleTabFollow(event: TabFollowed) {
        const row = this.createTabRow(event.tab);
        this.insertRowDependingOnWeight(row, event.tab.followState.weight);

        this.tabView.hideNoTabRow();
        this.moreMenuManipulator.initMoreDropdown(row);
        this.tabFilterApplier.applyFilter();
        this.tabCounter.incrementNumberOfFollowedTabs();
    }

    private insertRowDependingOnWeight(rowToInsert: HTMLElement, rowToInsertWeight: number) {
        const existingRowList = Array.from<HTMLElement>(this.tabView.tbodyElement.querySelectorAll('tr:not(.noTabRow)')).reverse();

        for (const existingRow of existingRowList) {
            const weightAttribute = existingRow.getAttribute('data-weight');
            const existingRowWeight = +weightAttribute;

            if (null === weightAttribute) {
                continue;
            } else if (existingRowWeight < rowToInsertWeight) {
                existingRow.insertAdjacentElement('afterend', rowToInsert);

                return;
            }
        }

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

    async onTabUnfollow(event: TabUnfollowed) {
        this.tabView.addPendingTask(this.handleTabUnfollow.bind(this, event));
    }

    private async handleTabUnfollow(event: TabUnfollowed) {
        const followedTabRow = this.getTabRowByFollowId(event.oldFollowState.id);

        if (followedTabRow) {
            jQuery(followedTabRow).find('[data-tooltip]').tooltip('remove');
            followedTabRow.remove();
            this.tabView.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfFollowedTabs();
        }
    }

    private getTabRowByFollowId(followId: string): HTMLTableRowElement {
        return this.tabView.tbodyElement.querySelector(`tr[data-follow-id="${followId}"]`);
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        this.tabView.addPendingTask(this.handleAssociateOpenedTabToFollowedTab.bind(this, event));
    }

    private async handleAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followedTabRow = this.getTabRowByFollowId(event.tabFollowState.id);

        if (followedTabRow) {
            this.updateTabOpenState(followedTabRow, true, event.tabOpenState.id);
            this.tabView.updateTabIncognitoState(followedTabRow, event.tabOpenState.isIncognito);
            this.tabView.updateTabReaderModeState(followedTabRow, event.tabOpenState.isInReaderMode);
            this.tabView.updateTabAudibleIndicator(followedTabRow, event.tabOpenState.isAudible);
            this.tabView.updateTabLastAccess(followedTabRow, event.tabOpenState.lastAccess);
            this.tabTitleManipulator.updateTitle(followedTabRow, event.tabOpenState.title);
            this.tabTitleManipulator.updateUrl(followedTabRow, event.tabOpenState.url);
            this.tabTitleManipulator.updateFavicon(followedTabRow, event.tabOpenState.faviconUrl);
            followedTabRow.removeAttribute('data-is-opening-tab');
        }
    }

    async onFollowedTabMove(event: FollowedTabMoved) {
        this.tabView.addPendingTask(this.handleFollowedTabMove.bind(this, event));
    }

    private async handleFollowedTabMove(event: FollowedTabMoved) {
        const followedTabRow = this.getTabRowByFollowId(event.tabFollowState.id);

        if (followedTabRow) {
            this.insertRowDependingOnWeight(followedTabRow, event.tabFollowState.weight);
            this.updateTabPosition(followedTabRow, event.tabFollowState.weight);
            this.tabView.updateTabLastAccess(followedTabRow, event.tabFollowState.openLastAccess);
        }
    }

    async onTabFocus(event: OpenedTabFocused) {
        this.tabView.addPendingTask(this.handleTabFocus.bind(this, event));
    }

    async handleTabFocus(event: OpenedTabFocused) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onTabFilterRequest(event: TabFilterRequested) {
        this.tabFilterApplier.setFilterTerms(event.filterTerms);
        this.tabFilterApplier.applyFilter();
    }
}
