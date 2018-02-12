import * as moment from 'moment';

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
import { StringMatcher } from '../utils/string-matcher';
import { TabCounter } from './tab-counter';

// TODO
declare global {
    interface JQuery {
        dropdown(...args: any[]): any;
        tooltip(method: 'open' | 'close' | 'remove'): JQuery;
    }
}

export class FollowedTabView {
    private tbodyElement: HTMLElement;
    private noTabRow: HTMLElement;
    private isInitDone = false;
    private pendingEvents: Array<() => void> = [];
    private filterTerms: string[] = null;

    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private stringMatcher: StringMatcher,
        private tabCounter: TabCounter,
        private containerElement: HTMLElement,
        private defaultFaviconUrl: string,
    ) {
        if (null == containerElement) {
            throw new Error('null container element received');
        }

        const tableElement = this.createTable(containerElement);
        containerElement.appendChild(tableElement);
        this.tbodyElement = tableElement.querySelector('tbody');
    }

    private createTable(containerElement: HTMLElement): HTMLTableElement {
        const table = document.createElement('table');
        table.classList.add('bordered');
        table.classList.add('highlight');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th class="indicators"></th>
                    <th class="lastAccess">Last access</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    async init() {
        const tabList = await this.queryBus.query(new GetTabAssociationsWithFollowState());
        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);
        let numberOfFollowedTabs = 0;

        for (const tab of tabList) {
            if (!tab.followState) {
                continue;
            }

            const row = this.createTabRow(tab);
            this.tbodyElement.appendChild(row);
            this.initActionsDropdown(row);
            numberOfFollowedTabs++;
        }

        this.isInitDone = true;
        this.tabCounter.setNumberOfFollowedTabs(numberOfFollowedTabs);
        await this.playPendingEvents();
        this.applyTabFilter();
        this.showNoTabRowIfTableIsEmpty();
    }

    private createNoTabRow() {
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '5');
        cell.textContent = 'No tab found';

        const row = document.createElement('tr');
        row.classList.add('transparent');
        row.classList.add('noTabRow');
        row.appendChild(cell);

        return row;
    }

    private createTabRow(tab: TabAssociation): HTMLElement {
        const row = document.createElement('tr');

        const titleCell = this.createTitleCell(tab, row);
        const onOffIndicatorsCell = this.createCell('indicators');
        const lastAccessCell = this.createCell('lastAccess');
        const actionsCell = this.createActionsCell(tab);
        this.addAudibleIndicator(onOffIndicatorsCell);
        this.addOnOffIndicator(onOffIndicatorsCell, 'muteIndicator', 'muted');
        this.addOnOffIndicator(onOffIndicatorsCell, 'openIndicator', 'opened');
        this.addOnOffIndicator(onOffIndicatorsCell, 'pinIndicator', 'pinned');
        this.addOnOffIndicator(onOffIndicatorsCell, 'readerModeIndicator', 'reader view');
        this.addOnOffIndicator(onOffIndicatorsCell, 'incognitoIndicator', 'incognito');

        row.setAttribute('data-follow-id', '' + tab.followState.id);
        row.appendChild(titleCell);
        row.appendChild(onOffIndicatorsCell);
        row.appendChild(lastAccessCell);
        row.appendChild(actionsCell);

        const tabOpenId = tab.openState ? tab.openState.id : null;
        this.updateTabFavicon(row, tab.followState.faviconUrl);
        this.updateTabIncognitoState(row, tab.followState.isIncognito);
        this.updateTabOpenState(row, this.isTabOpened(tab), tabOpenId);
        this.updateTabReaderModeState(row, tab.followState.isInReaderMode);
        this.updateTabAudibleIndicator(row, tab.openState ? tab.openState.isAudible : false);
        this.updateTabAudioMuteState(row, tab.openState ? tab.openState.isAudioMuted : false);
        this.updateTabPinState(row, tab.openState ? tab.openState.isPinned : false);
        this.updateTabTitle(row, tab.followState.title);
        this.updateTabUrl(row, tab.followState.url);
        this.updateTabLastAccess(row, tab.followState.openLastAccess);

        return row;
    }

    private isTabOpened(tab: TabAssociation) {
        return !!tab.openState;
    }

    private createCell(className?: string): HTMLElement {
        const cell = document.createElement('td');

        if (className) {
            cell.classList.add(className);
        }

        return cell;
    }

    private createTitleCell(tab: TabAssociation, row: HTMLElement): HTMLElement {
        const linkElement = document.createElement('a');
        linkElement.innerHTML = `
            <img />
            <span></span>
        `;
        linkElement.addEventListener('click', (event) => {
            const openTabId = +row.getAttribute('data-opened-tab-id');
            const isOpeningTab = !!row.getAttribute('data-is-opening-tab');

            if (openTabId) {
                this.commandBus.handle(new FocusTab(openTabId));
            } else if (!isOpeningTab) {
                row.setAttribute('data-is-opening-tab', '1');
                this.commandBus.handle(new RestoreFollowedTab(tab.followState.id));
            }
        });
        linkElement.querySelector('img').addEventListener('error', (event) => {
            (event.target as HTMLImageElement).src = this.defaultFaviconUrl;
        });

        const cell = this.createCell('title');
        cell.appendChild(linkElement);

        return cell;
    }

    private addOnOffIndicator(cell: HTMLElement, className: string, label: string) {
        const badgeElement = document.createElement('span');
        badgeElement.classList.add(className);
        badgeElement.classList.add('badge');
        badgeElement.innerHTML = `<i class="material-icons"></i> <span>${label}</span>`;

        cell.appendChild(badgeElement);
    }

    private addAudibleIndicator(cell: HTMLElement) {
        const iconElement = document.createElement('span');
        iconElement.classList.add('audibleIndicator');
        iconElement.innerHTML = `<i class="material-icons">volume_up</i>`;

        cell.appendChild(iconElement);
    }

    private createActionsCell(tab: TabAssociation): HTMLElement {
        const dropdownId = `followed-tab-action-${tab.followState.id}`;
        const moreButton = document.createElement('a');
        moreButton.classList.add('more');
        moreButton.classList.add('waves-effect');
        moreButton.classList.add('waves-teal');
        moreButton.classList.add('btn-flat');
        moreButton.classList.add('dropdown-button');
        moreButton.setAttribute('data-activates', dropdownId);
        moreButton.setAttribute('href', '#');
        moreButton.setAttribute('data-tooltip', 'Actions');
        moreButton.innerHTML = '<i class="material-icons">more_vert</i>';
        jQuery(moreButton).tooltip();

        const cell = this.createCell('actions');
        cell.appendChild(moreButton);

        const dropdownContainer = document.createElement('div');
        dropdownContainer.innerHTML = `<ul id='${dropdownId}' class='dropdown-content tabRowDropdown'></ul>`;
        const dropdownElement = dropdownContainer.querySelector('.tabRowDropdown') as HTMLElement;
        cell.appendChild(dropdownElement);

        this.addPinTabAction(dropdownElement, tab);
        this.addUnpinTabAction(dropdownElement, tab);
        this.addMuteTabAction(dropdownElement, tab);
        this.addUnmuteTabAction(dropdownElement, tab);
        this.addDuplicateTabAction(dropdownElement, tab);
        this.addReloadTabAction(dropdownElement, tab);
        this.addActionSeparator(dropdownElement);
        this.addCloseTabAction(dropdownElement, tab);
        this.addUnfollowTabAction(dropdownElement, tab);

        return cell;
    }

    private addActionSeparator(dropdownElement: HTMLElement) {
        const separatorElement = document.createElement('li');
        separatorElement.classList.add('divider');

        dropdownElement.appendChild(separatorElement);
    }

    private addUnfollowTabAction(cell: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('unfollowButton');
        containerElement.classList.add('warning');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">not_interested</i> Unfollow</a>`;
        const unfollowButton = containerElement.querySelector('a');

        unfollowButton.addEventListener('click', async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });

        cell.appendChild(containerElement);
    }

    private addPinTabAction(cell: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('pinButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">stars</i> Pin</a>`;
        const pinButton = containerElement.querySelector('a');

        pinButton.addEventListener('click', async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

            if (null == upToDateTab.openState) {
                return;
            }

            this.commandBus.handle(new PinTab(upToDateTab.openState.id));
        });

        cell.appendChild(containerElement);
    }

    private addUnpinTabAction(cell: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('unpinButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">stars</i> Unpin</a>`;
        const unpinButton = containerElement.querySelector('a');

        unpinButton.addEventListener('click', async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

            if (null == upToDateTab.openState) {
                return;
            }

            this.commandBus.handle(new UnpinTab(upToDateTab.openState.id));
        });

        cell.appendChild(containerElement);
    }

    private addMuteTabAction(dropdownElement: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('muteButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">volume_off</i> Mute</a>`;
        const muteButton = containerElement.querySelector('a');

        muteButton.addEventListener('click', async (event) => {
            this.commandBus.handle(new MuteTab(tab.openState.id));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addUnmuteTabAction(dropdownElement: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('unmuteButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">volume_up</i> Unmute</a>`;
        const unmuteButton = containerElement.querySelector('a');

        unmuteButton.addEventListener('click', async (event) => {
            this.commandBus.handle(new UnmuteTab(tab.openState.id));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addDuplicateTabAction(dropdownElement: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('duplicateButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">content_copy</i> Duplicate</a>`;
        const unpinButton = containerElement.querySelector('a');

        unpinButton.addEventListener('click', async (event) => {
            this.commandBus.handle(new DuplicateTab(tab.openState.id));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addReloadTabAction(dropdownElement: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('reloadButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">autorenew</i> Reload</a>`;
        const unpinButton = containerElement.querySelector('a');

        unpinButton.addEventListener('click', async (event) => {
            this.commandBus.handle(new ReloadTab(tab.openState.id));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addCloseTabAction(cell: HTMLElement, tab: TabAssociation) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('closeButton');
        containerElement.classList.add('warning');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">close</i> Close</a>`;
        const closeButton = containerElement.querySelector('a');

        closeButton.addEventListener('click', async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(tab.followState.id));

            if (null == upToDateTab.openState) {
                return;
            }

            this.commandBus.handle(new CloseTab(upToDateTab.openState.id));
        });

        cell.appendChild(containerElement);
    }

    private initActionsDropdown(row: HTMLElement) {
        const dropdownId = row.querySelector('.dropdown-button').getAttribute('data-activates');
        jQuery(`.dropdown-button[data-activates='${dropdownId}']`).dropdown({constrainWidth: false});
    }

    private updateTabTitle(row: HTMLElement, title: string) {
        row.querySelector('.title a span').textContent = title;
    }

    private updateTabFavicon(row: HTMLElement, faviconUrl: string) {
        const faviconElement = row.querySelector('.title a img') as HTMLImageElement;

        if (null == faviconUrl) {
            faviconElement.src = this.defaultFaviconUrl;
        } else {
            faviconElement.src = faviconUrl;
        }
    }

    private updateTabUrl(row: HTMLElement, url: string) {
        row.setAttribute('data-url', '' + url);
        row.querySelector('.title a').setAttribute('data-url', '' + url);
    }

    private updateTabLastAccess(row: HTMLElement, lastAccess: Date) {
        if (lastAccess) {
            row.querySelector('.lastAccess').innerHTML = moment(lastAccess).format('LLL');
        }
    }

    private updateTabOpenState(row: HTMLElement, isOpened: boolean, tabId: number) {
        row.setAttribute('data-opened-tab-id', '' + tabId);
        const titleCell = row.querySelector('.title');

        const closeButton = row.querySelector('.closeButton');
        const duplicateButton = row.querySelector('.duplicateButton');
        const reloadButton = row.querySelector('.reloadButton');
        const pinButton = row.querySelector('.pinButton');
        this.updateOnOffIndicator(row, 'openIndicator', isOpened);

        if (isOpened) {
            closeButton.classList.remove('transparent');
            duplicateButton.classList.remove('disabled');
            reloadButton.classList.remove('disabled');
            pinButton.classList.remove('disabled');
            titleCell.setAttribute('data-tooltip', 'Go to tab');
        } else {
            duplicateButton.classList.add('disabled');
            reloadButton.classList.add('disabled');
            pinButton.classList.add('disabled');
            closeButton.classList.add('transparent');
            titleCell.setAttribute('data-tooltip', 'Open tab');
        }

        jQuery(titleCell).tooltip();
    }

    private updateOnOffIndicator(row: HTMLElement, className: string, isOn: boolean) {
        const indicatorElement = row.querySelector(`.${className}`);

        if (isOn) {
            indicatorElement.classList.remove('off');
            indicatorElement.classList.add('on');
            indicatorElement.querySelector('.material-icons').textContent = 'check_circle';
        } else {
            indicatorElement.classList.add('off');
            indicatorElement.classList.remove('on');
            indicatorElement.querySelector('.material-icons').textContent = 'cancel';
        }
    }

    private updateTabAudibleIndicator(row: HTMLElement, isOn: boolean) {
        const indicatorElement = row.querySelector(`.audibleIndicator`);

        if (isOn) {
            indicatorElement.classList.remove('off');
            indicatorElement.classList.add('on');
            indicatorElement.setAttribute('data-tooltip', 'Producing sound');
            jQuery(indicatorElement).tooltip();
        } else {
            indicatorElement.classList.add('off');
            indicatorElement.classList.remove('on');
            jQuery(indicatorElement).tooltip('remove');
        }
    }

    private updateTabAudioMuteState(row: HTMLElement, isAudioMuted: boolean) {
        this.updateOnOffIndicator(row, 'muteIndicator', isAudioMuted);
        const muteButton = row.querySelector('.muteButton');
        const unmuteButton = row.querySelector('.unmuteButton');

        if (isAudioMuted) {
            muteButton.classList.add('transparent');
            unmuteButton.classList.remove('transparent');
        } else {
            muteButton.classList.remove('transparent');
            unmuteButton.classList.add('transparent');
        }
    }

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        this.updateOnOffIndicator(row, 'readerModeIndicator', isInReaderMode);
    }

    private updateTabPinState(row: HTMLElement, isPinned: boolean) {
        this.updateOnOffIndicator(row, 'pinIndicator', isPinned);
        const pinButton = row.querySelector('.pinButton');
        const unpinButton = row.querySelector('.unpinButton');

        if (isPinned) {
            pinButton.classList.add('transparent');
            unpinButton.classList.remove('transparent');
        } else {
            pinButton.classList.remove('transparent');
            unpinButton.classList.add('transparent');
        }
    }

    private updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        this.updateOnOffIndicator(row, 'incognitoIndicator', isIncognito);
    }

    show() {
        this.containerElement.classList.add('show');
    }

    hide() {
        this.containerElement.classList.remove('show');
    }

    async onTabClose(event: TabClosed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabClose.bind(this, event));
            return;
        }

        await this.handleTabClose(event);
    }

    private async handleTabClose(event: TabClosed) {
        const tabRow = this.getTabRowByOpenTabId(event.closedTab.id);

        if (tabRow) {
            tabRow.removeAttribute('data-opened-tab-id');
            const followId = tabRow.getAttribute('data-follow-id');
            const upToDateTab = await this.queryBus.query(new GetTabAssociationByFollowId(followId));
            this.updateTabAudibleIndicator(tabRow, false);
            this.updateTabPinState(tabRow, false);
            this.updateTabTitle(tabRow, upToDateTab.followState.title);
            this.updateTabUrl(tabRow, upToDateTab.followState.url);
            this.updateTabFavicon(tabRow, upToDateTab.followState.faviconUrl);
            this.updateTabOpenState(tabRow, false, null);
        }
    }

    private isEventHandlingNotReady() {
        return !this.isInitDone || this.pendingEvents.length;
    }

    private getTabRowByOpenTabId(openTabId: number): HTMLTableRowElement {
        return this.tbodyElement.querySelector(`tr[data-opened-tab-id="${openTabId}"]`);
    }

    async onOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabFaviconUrlUpdate.bind(this, event));
            return;
        }

        await this.handleTabFaviconUrlUpdate(event);
    }

    private async handleTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabTitleUpdate.bind(this, event));
            return;
        }

        await this.handleTabTitleUpdate(event);
    }

    private async handleTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabTitle(tabRow, event.tabOpenState.title);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabUrlUpdate.bind(this, event));
            return;
        }

        await this.handleTabUrlUpdate(event);
    }

    private async handleTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabReaderModeStateUpdate.bind(this, event));
            return;
        }

        await this.handleTabReaderModeStateUpdate(event);
    }

    private async handleTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabAudibleStateUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabAudibleStateUpdate(event);
    }

    private async handleOpenTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabAudibleIndicator(tabRow, event.tabOpenState.isAudible);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabAudibleStateUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabAudioMuteStateUpdate(event);
    }

    private async handleOpenTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabAudioMuteState(tabRow, event.tabOpenState.isAudioMuted);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabPinStateUpdate.bind(this, event));
            return;
        }

        await this.handleTabPinStateUpdate(event);
    }

    private async handleTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabPinState(tabRow, event.tabOpenState.isPinned);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onTabFollow(event: TabFollowed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabFollow.bind(this, event));
            return;
        }

        await this.handleTabFollow(event);
    }

    private async handleTabFollow(event: TabFollowed) {
        const row = this.createTabRow(event.tab);
        this.tbodyElement.appendChild(row);

        this.noTabRow.classList.add('transparent');
        this.initActionsDropdown(row);
        this.applyTabFilter();
        this.tabCounter.incrementNumberOfFollowedTabs();
    }

    async onTabUnfollow(event: TabUnfollowed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabUnfollow.bind(this, event));
            return;
        }

        await this.handleTabUnfollow(event);
    }

    private async handleTabUnfollow(event: TabUnfollowed) {
        const followedTabRow = this.tbodyElement.querySelector(`tr[data-follow-id="${event.oldFollowState.id}"]`);

        if (followedTabRow) {
            jQuery(followedTabRow).find('[data-tooltip]').tooltip('close');
            followedTabRow.remove();
            this.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfFollowedTabs();
        }
    }

    private showNoTabRowIfTableIsEmpty() {
        if (this.tbodyElement.querySelectorAll('tr:not(.filtered):not(.noTabRow)').length <= 0) {
            this.noTabRow.classList.remove('transparent');
        } else {
            this.noTabRow.classList.add('transparent');
        }
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleAssociateOpenedTabToFollowedTab.bind(this, event));
            return;
        }

        await this.handleAssociateOpenedTabToFollowedTab(event);
    }

    private async handleAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followedTabRow: HTMLElement = this.tbodyElement.querySelector(`tr[data-follow-id="${event.tabFollowState.id}"]`);

        if (followedTabRow) {
            this.updateTabFavicon(followedTabRow, event.tabOpenState.faviconUrl);
            this.updateTabIncognitoState(followedTabRow, event.tabOpenState.isIncognito);
            this.updateTabOpenState(followedTabRow, true, event.tabOpenState.id);
            this.updateTabReaderModeState(followedTabRow, event.tabOpenState.isInReaderMode);
            this.updateTabTitle(followedTabRow, event.tabOpenState.title);
            this.updateTabUrl(followedTabRow, event.tabOpenState.url);
            this.updateTabLastAccess(followedTabRow, event.tabOpenState.lastAccess);
            followedTabRow.removeAttribute('data-is-opening-tab');
        }
    }

    async onTabFocus(event: OpenedTabFocused) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabFocus.bind(this, event));
            return;
        }

        await this.handleTabFocus(event);
    }

    async handleTabFocus(event: OpenedTabFocused) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onTabFilterRequest(event: TabFilterRequested) {
        this.filterTerms = event.filterTerms;
        this.applyTabFilter();
    }

    private applyTabFilter() {
        if (!this.isInitDone || !this.hasFilterTerms()) {
            return;
        }

        const rowList = Array.from(this.tbodyElement.querySelectorAll('tr'));

        for (const row of rowList) {
            if (row.classList.contains('noTabRow')) {
                continue;
            }

            const titleCell = row.querySelector('.title a');
            const title = titleCell.textContent.toLowerCase().trim();
            const url = titleCell.getAttribute('data-url').toLowerCase().trim();

            if (this.stringMatcher.isCaseSensitiveMatch(this.filterTerms, [title, url])) {
                row.classList.remove('filtered');
            } else {
                row.classList.add('filtered');
            }
        }

        this.showNoTabRowIfTableIsEmpty();
    }

    private hasFilterTerms() {
        return null !== this.filterTerms && this.filterTerms.length > 0;
    }

    private async playPendingEvents() {
        while (this.pendingEvents.length) {
            const callback = this.pendingEvents.pop();
            await callback();
        }

        this.pendingEvents = [];
    }
}
