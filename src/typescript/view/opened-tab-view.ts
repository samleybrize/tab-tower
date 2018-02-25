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
import { TabCounter } from './tab-counter';
import { TabView } from './tab-view';

export class OpenedTabView {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private tabCounter: TabCounter,
        private tabView: TabView,
    ) {
    }

    async init() {
        this.tabView.init(() => {
            const tabIdList = this.getTabIdListToMove();

            this.commandBus.handle(new MoveOpenedTabs(tabIdList, 0));

            this.tabView.disableMoveMode();
        });
        const tabList = await this.queryBus.query(new GetTabAssociationsWithOpenState());
        let numberOfOpenedTabs = 0;

        for (const tab of tabList) {
            if (!tab.openState) {
                continue;
            }

            const row = this.createTabRow(tab.openState, this.isTabFollowed(tab));
            this.tabView.tbodyElement.appendChild(row);
            this.tabView.initActionsDropdown(row);
            numberOfOpenedTabs++;
        }

        this.tabView.isInitialized = true;
        this.tabCounter.setNumberOfOpenedTabs(numberOfOpenedTabs);
        this.createSelectedTabsActions(this.tabView.titleActionsCell);
        await this.tabView.playPendingTasks();
        this.tabView.applyTabFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
    }

    private isTabFollowed(tab: TabAssociation) {
        return !!tab.followState;
    }

    private createTabRow(tabOpenState: TabOpenState, isFollowed: boolean): HTMLElement {
        const tabRow = this.tabView.createTabRow(
            `opened-tab-${tabOpenState.id}`,
            tabOpenState.title,
            tabOpenState.url,
            tabOpenState.faviconUrl,
            tabOpenState.isAudible,
            tabOpenState.lastAccess,
            (row) => {
                const tabId = +row.getAttribute('data-tab-id');

                if (tabId) {
                    this.commandBus.handle(new FocusTab(tabId));
                }
            },
            (targetRow) => {
                const targetIndex = +targetRow.getAttribute('data-index') + 1;
                const tabIdList = this.getTabIdListToMove();

                this.commandBus.handle(new MoveOpenedTabs(tabIdList, targetIndex));

                this.tabView.disableMoveMode();
            },
        );

        tabRow.row.setAttribute('data-tab-id', '' + tabOpenState.id);

        this.tabView.addMuteIndicator(tabRow.onOffIndicatorsCell);
        this.tabView.addOnOffIndicator(tabRow.onOffIndicatorsCell, 'followedIndicator', 'followed');
        this.tabView.addPinIndicator(tabRow.onOffIndicatorsCell);
        this.tabView.addReaderModeIndicator(tabRow.onOffIndicatorsCell);
        this.tabView.addIncognitoIndicator(tabRow.onOffIndicatorsCell);
        this.createTabActions(tabRow.actionsCell, tabOpenState);

        this.updateFollowState(tabRow.row, isFollowed);
        this.updateTabIndex(tabRow.row, tabOpenState.index);
        this.tabView.updateTabFavicon(tabRow.row, tabOpenState.faviconUrl);
        this.tabView.updateTabIncognitoState(tabRow.row, tabOpenState.isIncognito);
        this.tabView.updateTabReaderModeState(tabRow.row, tabOpenState.isInReaderMode);
        this.tabView.updateTabAudibleIndicator(tabRow.row, tabOpenState.isAudible);
        this.tabView.updateTabAudioMuteState(tabRow.row, tabOpenState.isAudioMuted);
        this.tabView.updateTabPinState(tabRow.row, tabOpenState.isPinned);
        this.tabView.updateTabTitle(tabRow.row, tabOpenState.title);
        this.updateTabUrl(tabRow.row, tabOpenState.url, tabOpenState.isPrivileged, tabOpenState.isIgnored);
        this.tabView.updateTabLastAccess(tabRow.row, tabOpenState.lastAccess);
        this.tabView.updateTabTitleTooltip(tabRow.row, 'Go to tab');

        return tabRow.row;
    }

    private getTabIdListToMove() {
        const tabRowsToMove = this.tabView.getTabRowsToMove();

        if (null == tabRowsToMove) {
            return [];
        }

        const tabIdList: number[] = [];

        for (const tabRowToMove of tabRowsToMove) {
            tabIdList.push(+tabRowToMove.getAttribute('data-tab-id'));
        }

        return tabIdList;
    }

    private createSelectedTabsActions(cell: HTMLElement) {
        this.tabView.addFollowSelectedTabsAction(cell);
        this.tabView.addPinSelectedTabsAction(cell);
        this.tabView.addUnpinSelectedTabsAction(cell);
        this.tabView.addMuteSelectedTabsAction(cell);
        this.tabView.addUnmuteSelectedTabsAction(cell);
        this.addMoveSelectedTabsAction(cell);
        this.tabView.addDuplicateSelectedTabsAction(cell);
        this.tabView.addReloadSelectedTabsAction(cell);
        this.tabView.addActionSeparator(cell);
        this.tabView.addCloseSelectedTabsAction(cell);
        this.tabView.addUnfollowSelectedTabsAction(cell);
    }

    private createTabActions(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.addFollowTabAction(cell, tabOpenState);
        this.addPinTabAction(cell, tabOpenState);
        this.addUnpinTabAction(cell, tabOpenState);
        this.addMuteTabAction(cell, tabOpenState);
        this.addUnmuteTabAction(cell, tabOpenState);
        this.addMoveTabAction(cell, tabOpenState);
        this.addDuplicateTabAction(cell, tabOpenState);
        this.addReloadTabAction(cell, tabOpenState);
        this.tabView.addActionSeparator(cell);
        this.addCloseTabAction(cell, tabOpenState);
        this.addUnfollowTabAction(cell, tabOpenState);
    }

    private addFollowTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addFollowTabAction(cell, async (event) => {
            if (this.tabView.isFollowButtonDisabled(cell)) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabAssociationByOpenId(tabOpenState.id));
            this.commandBus.handle(new FollowTab(upToDateTab));
        });
    }

    private addUnfollowTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addUnfollowTabAction(cell, async (event) => {
            if (this.tabView.isUnfollowButtonDisabled(cell)) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabAssociationByOpenId(tabOpenState.id));
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });
    }

    private addPinTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addPinTabAction(cell, async (event) => {
            this.commandBus.handle(new PinTab(tabOpenState.id));
        });
    }

    private addUnpinTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addUnpinTabAction(cell, async (event) => {
            this.commandBus.handle(new UnpinTab(tabOpenState.id));
        });
    }

    private addMuteTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addMuteTabAction(cell, async (event) => {
            this.commandBus.handle(new MuteTab(tabOpenState.id));
        });
    }

    private addUnmuteTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addUnmuteTabAction(cell, async (event) => {
            this.commandBus.handle(new UnmuteTab(tabOpenState.id));
        });
    }

    private addMoveTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addMoveTabAction(cell, async (event) => {
            this.tabView.enableMoveMode([cell.parentElement]);
        });
    }

    private addMoveSelectedTabsAction(cell: HTMLElement) {
        this.tabView.addMoveSelectedTabsAction(cell, async (event) => {
            const checkedList = Array.from<HTMLElement>(this.tabView.tbodyElement.querySelectorAll('.tabSelector input:checked'));
            const selectedRows: HTMLElement[] = [];

            for (const checkboxElement of checkedList) {
                const row = checkboxElement.closest('tr') as HTMLElement;
                selectedRows.push(row);
            }

            if (0 == selectedRows.length) {
                return;
            }

            this.tabView.enableMoveMode(selectedRows);
        });
    }

    private addDuplicateTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addDuplicateTabAction(cell, async (event) => {
            this.commandBus.handle(new DuplicateTab(tabOpenState.id));
        });
    }

    private addReloadTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addReloadTabAction(cell, async (event) => {
            this.commandBus.handle(new ReloadTab(tabOpenState.id));
        });
    }

    private addCloseTabAction(cell: HTMLElement, tabOpenState: TabOpenState) {
        this.tabView.addCloseTabAction(cell, async (event) => {
            if (this.tabView.isCloseButtonDisabled(cell)) {
                return;
            }

            this.commandBus.handle(new CloseTab(tabOpenState.id));
        });
    }

    private updateTabUrl(row: HTMLElement, url: string, isPrivileged: boolean, isIgnored: boolean) {
        this.tabView.updateTabUrl(row, url);

        if (isPrivileged || isIgnored) {
            this.tabView.disableFollowButton(row);
            this.tabView.disableUnfollowButton(row);
        } else {
            this.tabView.enableFollowButton(row);
            this.tabView.enableUnfollowButton(row);
        }

        if (isIgnored) {
            this.tabView.disableCloseButton(row);
        } else {
            this.tabView.enableCloseButton(row);
        }
    }

    private updateTabIndex(row: HTMLElement, index: number) {
        row.setAttribute('data-index', '' + index);
    }

    private updateFollowState(row: HTMLElement, isFollowed: boolean) {
        this.tabView.updateOnOffIndicator(row, 'followedIndicator', isFollowed);

        if (isFollowed) {
            this.tabView.hideFollowButton(row);
            this.tabView.showUnfollowButton(row);
        } else {
            this.tabView.showFollowButton(row);
            this.tabView.hideUnfollowButton(row);
        }
    }

    show() {
        this.tabView.show();
    }

    hide() {
        this.tabView.hide();
    }

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

        this.tabView.initActionsDropdown(rowToInsert);
        this.tabView.applyTabFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
        this.tabCounter.incrementNumberOfOpenedTabs();
    }

    private insertRowAtIndex(rowToInsert: HTMLElement, insertAtIndex: number) {
        const rowList = Array.from(this.tabView.tbodyElement.querySelectorAll('tr')).reverse();

        for (const existingRow of rowList) {
            const rowIndex = +existingRow.getAttribute('data-index');

            if (null !== rowIndex && rowIndex < insertAtIndex) {
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
            this.tabView.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfOpenedTabs();
        }
    }

    async onOpenTabMove(event: OpenedTabMoved) {
        this.tabView.addPendingTask(this.handleOpenTabMode.bind(this, event));
    }

    private async handleOpenTabMode(event: OpenedTabMoved) {
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
            this.tabView.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        this.tabView.addPendingTask(this.handleOpenTabTitleUpdate.bind(this, event));
    }

    private async handleOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabTitle(tabRow, event.tabOpenState.title);
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
        this.tabView.filterTabs(event.filterTerms);
    }
}
