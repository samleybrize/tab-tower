import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { CloseTab } from '../tab/command/close-tab';
import { DuplicateTab } from '../tab/command/duplicate-tab';
import { FocusTab } from '../tab/command/focus-tab';
import { MuteTab } from '../tab/command/mute-tab';
import { PinTab } from '../tab/command/pin-tab';
import { ReloadTab } from '../tab/command/reload-tab';
import { RestoreFollowedTab } from '../tab/command/restore-followed-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { UnmuteTab } from '../tab/command/unmute-tab';
import { UnpinTab } from '../tab/command/unpin-tab';
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
import { TabCounter } from './tab-counter';
import { TabView } from './tab-view';

export class FollowedTabView {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private tabCounter: TabCounter,
        private tabView: TabView,
    ) {
    }

    async init() {
        const tabList = await this.queryBus.query(new GetTabAssociationsWithFollowState());
        let numberOfFollowedTabs = 0;

        for (const tab of tabList) {
            if (!tab.followState) {
                continue;
            }

            const row = this.createTabRow(tab);
            this.tabView.tbodyElement.appendChild(row);
            this.tabView.initActionsDropdown(row);
            numberOfFollowedTabs++;
        }

        this.tabView.isInitialized = true;
        this.tabCounter.setNumberOfFollowedTabs(numberOfFollowedTabs);
        this.createTitleActions(this.tabView.titleActionsCell);
        await this.tabView.playPendingTasks();
        this.tabView.applyTabFilter();
        this.tabView.showNoTabRowIfTableIsEmpty();
    }

    private createTabRow(tab: TabAssociation): HTMLElement {
        const tabRow = this.tabView.createTabRow(
            `followed-tab-${tab.followState.id}`,
            tab.followState.title,
            tab.followState.url,
            tab.followState.faviconUrl,
            tab.openState ? tab.openState.isAudible : false,
            tab.followState.openLastAccess,
            (row) => {
                const openTabId = +row.getAttribute('data-opened-tab-id');
                const isOpeningTab = !!row.getAttribute('data-is-opening-tab');

                if (openTabId) {
                    this.commandBus.handle(new FocusTab(openTabId));
                } else if (!isOpeningTab) {
                    row.setAttribute('data-is-opening-tab', '1');
                    this.commandBus.handle(new RestoreFollowedTab(tab.followState.id));
                }
            },
        );

        tabRow.row.setAttribute('data-follow-id', '' + tab.followState.id);

        this.tabView.addMuteIndicator(tabRow.onOffIndicatorsCell);
        this.tabView.addOnOffIndicator(tabRow.onOffIndicatorsCell, 'openIndicator', 'opened');
        this.tabView.addPinIndicator(tabRow.onOffIndicatorsCell);
        this.tabView.addReaderModeIndicator(tabRow.onOffIndicatorsCell);
        this.tabView.addIncognitoIndicator(tabRow.onOffIndicatorsCell);
        this.createTabActions(tabRow.actionsCell, tab);

        const tabOpenId = tab.openState ? tab.openState.id : null;
        this.updateTabOpenState(tabRow.row, this.isTabOpened(tab), tabOpenId);
        this.tabView.updateTabIncognitoState(tabRow.row, tab.followState.isIncognito);
        this.tabView.updateTabReaderModeState(tabRow.row, tab.followState.isInReaderMode);
        this.tabView.updateTabAudioMuteState(tabRow.row, tab.followState.isAudioMuted);
        this.tabView.updateTabPinState(tabRow.row, tab.openState ? tab.openState.isPinned : false);

        return tabRow.row;
    }

    private isTabOpened(tab: TabAssociation) {
        return !!tab.openState;
    }

    private createTitleActions(cell: HTMLElement) {
        this.tabView.addPinSelectedTabsAction(cell);
        this.tabView.addUnpinSelectedTabsAction(cell);
        this.tabView.addMuteSelectedTabsAction(cell);
        this.tabView.addUnmuteSelectedTabsAction(cell);
        this.tabView.addDuplicateSelectedTabsAction(cell);
        this.tabView.addReloadSelectedTabsAction(cell);
        this.tabView.addActionSeparator(cell);
        this.tabView.addCloseSelectedTabsAction(cell);
        this.tabView.addUnfollowSelectedTabsAction(cell);
    }

    private createTabActions(cell: HTMLElement, tab: TabAssociation) {
        this.addPinTabAction(cell, tab);
        this.addUnpinTabAction(cell, tab);
        this.addMuteTabAction(cell, tab);
        this.addUnmuteTabAction(cell, tab);
        this.addDuplicateTabAction(cell, tab);
        this.addReloadTabAction(cell, tab);
        this.tabView.addActionSeparator(cell);
        this.addCloseTabAction(cell, tab);
        this.addUnfollowTabAction(cell, tab);
    }

    private addUnfollowTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addUnfollowTabAction(cell, async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });
    }

    private addPinTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addPinTabAction(cell, async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

            if (null == upToDateTab.openState) {
                return;
            }

            this.commandBus.handle(new PinTab(upToDateTab.openState.id));
        });
    }

    private addUnpinTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addUnpinTabAction(cell, async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

            if (null == upToDateTab.openState) {
                return;
            }

            this.commandBus.handle(new UnpinTab(upToDateTab.openState.id));
        });
    }

    private addMuteTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addMuteTabAction(cell, async (event) => {
            this.commandBus.handle(new MuteTab(tab.openState.id));
        });
    }

    private addUnmuteTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addUnmuteTabAction(cell, async (event) => {
            this.commandBus.handle(new UnmuteTab(tab.openState.id));
        });
    }

    private addDuplicateTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addDuplicateTabAction(cell, async (event) => {
            this.commandBus.handle(new DuplicateTab(tab.openState.id));
        });
    }

    private addReloadTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addReloadTabAction(cell, async (event) => {
            this.commandBus.handle(new ReloadTab(tab.openState.id));
        });
    }

    private addCloseTabAction(cell: HTMLElement, tab: TabAssociation) {
        this.tabView.addCloseTabAction(cell, async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

            if (null == upToDateTab.openState) {
                return;
            }

            this.commandBus.handle(new CloseTab(upToDateTab.openState.id));
        });
    }

    private updateTabOpenState(row: HTMLElement, isOpened: boolean, tabId: number) {
        row.setAttribute('data-opened-tab-id', '' + tabId);
        this.tabView.updateOnOffIndicator(row, 'openIndicator', isOpened);

        if (isOpened) {
            this.tabView.showCloseButton(row);
            this.tabView.enableDuplicateButton(row);
            this.tabView.enableMuteButton(row);
            this.tabView.enablePinButton(row);
            this.tabView.enableReloadButton(row);
            this.tabView.enableUnmuteButton(row);
            this.tabView.updateTabTitleTooltip(row, 'Go to tab');
        } else {
            this.tabView.hideCloseButton(row);
            this.tabView.disableDuplicateButton(row);
            this.tabView.disableMuteButton(row);
            this.tabView.disablePinButton(row);
            this.tabView.disableReloadButton(row);
            this.tabView.disableUnmuteButton(row);
            this.tabView.updateTabTitleTooltip(row, 'Open tab');
        }
    }

    show() {
        this.tabView.show();
    }

    hide() {
        this.tabView.hide();
    }

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
            this.tabView.updateTabTitle(tabRow, upToDateTab.followState.title);
            this.tabView.updateTabUrl(tabRow, upToDateTab.followState.url);
            this.tabView.updateTabFavicon(tabRow, upToDateTab.followState.faviconUrl);
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
            this.tabView.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        this.tabView.addPendingTask(this.handleTabTitleUpdate.bind(this, event));
    }

    private async handleTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabTitle(tabRow, event.tabOpenState.title);
            this.tabView.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        this.tabView.addPendingTask(this.handleTabUrlUpdate.bind(this, event));
    }

    private async handleTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.tabView.updateTabUrl(tabRow, event.tabOpenState.url);
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
        this.tabView.tbodyElement.appendChild(row);

        this.tabView.hideNoTabRow();
        this.tabView.initActionsDropdown(row);
        this.tabView.applyTabFilter();
        this.tabCounter.incrementNumberOfFollowedTabs();
    }

    async onTabUnfollow(event: TabUnfollowed) {
        this.tabView.addPendingTask(this.handleTabUnfollow.bind(this, event));
    }

    private async handleTabUnfollow(event: TabUnfollowed) {
        const followedTabRow = this.tabView.tbodyElement.querySelector(`tr[data-follow-id="${event.oldFollowState.id}"]`);

        if (followedTabRow) {
            jQuery(followedTabRow).find('[data-tooltip]').tooltip('remove');
            followedTabRow.remove();
            this.tabView.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfFollowedTabs();
        }
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        this.tabView.addPendingTask(this.handleAssociateOpenedTabToFollowedTab.bind(this, event));
    }

    private async handleAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followedTabRow: HTMLElement = this.tabView.tbodyElement.querySelector(`tr[data-follow-id="${event.tabFollowState.id}"]`);

        if (followedTabRow) {
            this.tabView.updateTabFavicon(followedTabRow, event.tabOpenState.faviconUrl);
            this.updateTabOpenState(followedTabRow, true, event.tabOpenState.id);
            this.tabView.updateTabIncognitoState(followedTabRow, event.tabOpenState.isIncognito);
            this.tabView.updateTabReaderModeState(followedTabRow, event.tabOpenState.isInReaderMode);
            this.tabView.updateTabTitle(followedTabRow, event.tabOpenState.title);
            this.tabView.updateTabUrl(followedTabRow, event.tabOpenState.url);
            this.tabView.updateTabAudibleIndicator(followedTabRow, event.tabOpenState.isAudible);
            this.tabView.updateTabLastAccess(followedTabRow, event.tabOpenState.lastAccess);
            followedTabRow.removeAttribute('data-is-opening-tab');
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
        this.tabView.filterTabs(event.filterTerms);
    }
}
