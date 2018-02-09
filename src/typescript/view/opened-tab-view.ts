import * as moment from 'moment';

import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { CloseTab } from '../tab/command/close-tab';
import { FocusTab } from '../tab/command/focus-tab';
import { FollowTab } from '../tab/command/follow-tab';
import { PinTab } from '../tab/command/pin-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { UnpinTab } from '../tab/command/unpin-tab';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
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
import { StringMatcher } from '../utils/string-matcher';
import { TabCounter } from './tab-counter';

// TODO
declare global {
    interface JQuery {
        dropdown(...args: any[]): any;
    }
}

export class OpenedTabView {
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
        const tabList = await this.queryBus.query(new GetTabAssociationsWithOpenState());
        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);
        let numberOfOpenedTabs = 0;

        for (const tab of tabList) {
            if (!tab.openState) {
                continue;
            }

            const row = this.createTabRow(tab.openState, this.isTabFollowed(tab));
            this.tbodyElement.appendChild(row);
            this.initActionsDropdown(row);
            numberOfOpenedTabs++;
        }

        this.isInitDone = true;
        this.tabCounter.setNumberOfOpenedTabs(numberOfOpenedTabs);
        await this.playPendingEvents();
        this.applyTabFilter();
        this.showNoTabRowIfTableIsEmpty();
    }

    private isTabFollowed(tab: TabAssociation) {
        return !!tab.followState;
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

    private createTabRow(tabOpenState: TabOpenState, isFollowed: boolean): HTMLElement {
        const row = document.createElement('tr');

        const titleCell = this.createTitleCell(row);
        const onOffIndicatorsCell = this.createCell('indicators');
        const lastAccessCell = this.createCell('lastAccess');
        const actionsCell = this.createActionsCell(tabOpenState);
        this.addOnOffIndicator(onOffIndicatorsCell, 'incognitoIndicator', 'incognito');
        this.addOnOffIndicator(onOffIndicatorsCell, 'readerModeIndicator', 'reader view');
        this.addOnOffIndicator(onOffIndicatorsCell, 'pinIndicator', 'pinned');
        this.addOnOffIndicator(onOffIndicatorsCell, 'followedIndicator', 'followed');

        row.setAttribute('data-tab-id', '' + tabOpenState.id);
        row.appendChild(titleCell);
        row.appendChild(onOffIndicatorsCell);
        row.appendChild(lastAccessCell);
        row.appendChild(actionsCell);

        this.updateTabFavicon(row, tabOpenState.faviconUrl);
        this.updateTabIncognitoState(row, tabOpenState.isIncognito);
        this.updateTabIndex(row, tabOpenState.index);
        this.updateTabReaderModeState(row, tabOpenState.isInReaderMode);
        this.updateTabPinState(row, tabOpenState.isPinned);
        this.updateTabTitle(row, tabOpenState.title);
        this.updateTabUrl(row, tabOpenState.url, tabOpenState.isPrivileged, tabOpenState.isIgnored);
        this.updateTabLastAccess(row, tabOpenState.lastAccess);
        this.updateFollowState(row, isFollowed);

        return row;
    }

    private createCell(className?: string): HTMLElement {
        const cell = document.createElement('td');

        if (className) {
            cell.classList.add(className);
        }

        return cell;
    }

    private createTitleCell(row: HTMLElement): HTMLElement {
        const linkElement = document.createElement('a');
        linkElement.innerHTML = `
            <img />
            <span></span>
        `;
        linkElement.addEventListener('click', (event) => {
            const tabId = +row.getAttribute('data-tab-id');

            if (tabId) {
                this.commandBus.handle(new FocusTab(tabId));
            }
        });
        linkElement.querySelector('img').addEventListener('error', (event) => {
            (event.target as HTMLImageElement).src = this.defaultFaviconUrl;
        });

        const cell = this.createCell('title');
        cell.setAttribute('data-tooltip', 'Go to tab');
        cell.appendChild(linkElement);

        jQuery(cell).tooltip();

        return cell;
    }

    private addOnOffIndicator(cell: HTMLElement, className: string, label: string) {
        const badgeElement = document.createElement('span');
        badgeElement.classList.add(className);
        badgeElement.classList.add('badge');
        badgeElement.innerHTML = `<i class="material-icons"></i> <span>${label}</span>`;

        cell.appendChild(badgeElement);
    }

    private createActionsCell(tabOpenState: TabOpenState): HTMLElement {
        const dropdownId = `opened-tab-action-${tabOpenState.id}`;
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

        this.addFollowTabAction(dropdownElement, tabOpenState);
        this.addPinTabAction(dropdownElement, tabOpenState);
        this.addUnpinTabAction(dropdownElement, tabOpenState);
        this.addActionSeparator(dropdownElement);
        this.addCloseTabAction(dropdownElement, tabOpenState);
        this.addUnfollowTabAction(dropdownElement, tabOpenState);

        return cell;
    }

    private addActionSeparator(dropdownElement: HTMLElement) {
        const separatorElement = document.createElement('li');
        separatorElement.classList.add('divider');

        dropdownElement.appendChild(separatorElement);
    }

    private addFollowTabAction(dropdownElement: HTMLElement, tabOpenState: TabOpenState) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('followButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">settings_backup_restore</i> Follow</a>`;
        const followButton = containerElement.querySelector('a');

        followButton.addEventListener('click', async (event) => {
            if (followButton.parentElement.classList.contains('disabled')) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabAssociationByOpenId(tabOpenState.id));
            this.commandBus.handle(new FollowTab(upToDateTab));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addUnfollowTabAction(dropdownElement: HTMLElement, tabOpenState: TabOpenState) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('unfollowButton');
        containerElement.classList.add('warning');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">not_interested</i> Unfollow</a>`;
        const unfollowButton = containerElement.querySelector('a');

        unfollowButton.addEventListener('click', async (event) => {
            if (unfollowButton.parentElement.classList.contains('disabled')) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabAssociationByOpenId(tabOpenState.id));
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addPinTabAction(dropdownElement: HTMLElement, tabOpenState: TabOpenState) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('pinButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">stars</i> Pin</a>`;
        const pinButton = containerElement.querySelector('a');

        pinButton.addEventListener('click', async (event) => {
            this.commandBus.handle(new PinTab(tabOpenState.id));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addUnpinTabAction(dropdownElement: HTMLElement, tabOpenState: TabOpenState) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('unpinButton');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">stars</i> Unpin</a>`;
        const unpinButton = containerElement.querySelector('a');

        unpinButton.addEventListener('click', async (event) => {
            this.commandBus.handle(new UnpinTab(tabOpenState.id));
        });

        dropdownElement.appendChild(containerElement);
    }

    private addCloseTabAction(dropdownElement: HTMLElement, tabOpenState: TabOpenState) {
        const containerElement = document.createElement('li');
        containerElement.classList.add('closeButton');
        containerElement.classList.add('warning');
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">close</i> Close</a>`;
        const closeButton = containerElement.querySelector('a');

        closeButton.addEventListener('click', async (event) => {
            if (closeButton.parentElement.classList.contains('disabled')) {
                return;
            }

            this.commandBus.handle(new CloseTab(tabOpenState.id));
        });

        dropdownElement.appendChild(containerElement);
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

    private updateTabUrl(row: HTMLElement, url: string, isPrivileged: boolean, isIgnored: boolean) {
        row.setAttribute('data-url', '' + url);
        row.querySelector('.title a').setAttribute('data-url', '' + url);

        const followButton = row.querySelector('.followButton');
        const unfollowButton = row.querySelector('.unfollowButton');
        const closeButton = row.querySelector('.closeButton');

        if (isPrivileged || isIgnored) {
            followButton.classList.add('disabled');
            unfollowButton.classList.add('disabled');
        } else {
            followButton.classList.remove('disabled');
            unfollowButton.classList.remove('disabled');
        }

        if (isIgnored) {
            closeButton.classList.add('disabled');
        } else {
            closeButton.classList.remove('disabled');
        }
    }

    private updateTabLastAccess(row: HTMLElement, lastAccess: Date) {
        if (lastAccess) {
            row.querySelector('.lastAccess').innerHTML = moment(lastAccess).format('LLL');
        }
    }

    private updateTabIndex(row: HTMLElement, index: number) {
        row.setAttribute('data-index', '' + index);
    }

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        this.updateOnOffIndicator(row, 'readerModeIndicator', isInReaderMode);
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

    private updateFollowState(row: HTMLElement, isFollowed: boolean) {
        this.updateOnOffIndicator(row, 'followedIndicator', isFollowed);
        const followButton = row.querySelector('.followButton');
        const unfollowButton = row.querySelector('.unfollowButton');

        if (isFollowed) {
            followButton.classList.add('transparent');
            unfollowButton.classList.remove('transparent');
        } else {
            followButton.classList.remove('transparent');
            unfollowButton.classList.add('transparent');
        }
    }

    show() {
        this.containerElement.classList.add('show');
    }

    hide() {
        this.containerElement.classList.remove('show');
    }

    async onTabOpen(event: TabOpened) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabOpen.bind(this, event));
            return;
        }

        await this.handleTabOpen(event);
    }

    private async handleTabOpen(event: TabOpened) {
        const existingTabRow = await this.getTabRowByTabId(event.tabOpenState.id);

        if (null !== existingTabRow) {
            return;
        }

        const rowToInsert = this.createTabRow(event.tabOpenState, false);

        if (0 == event.tabOpenState.index) {
            this.noTabRow.insertAdjacentElement('afterend', rowToInsert);
        } else {
            this.insertRowAtIndex(rowToInsert, event.tabOpenState.index);
        }

        this.initActionsDropdown(rowToInsert);
        this.applyTabFilter();
        this.showNoTabRowIfTableIsEmpty();
        this.tabCounter.incrementNumberOfOpenedTabs();
    }

    private isEventHandlingNotReady() {
        return !this.isInitDone || this.pendingEvents.length;
    }

    private insertRowAtIndex(rowToInsert: HTMLElement, insertAtIndex: number) {
        const rowList = Array.from(this.tbodyElement.querySelectorAll('tr')).reverse();

        for (const existingRow of rowList) {
            const rowIndex = +existingRow.getAttribute('data-index');

            if (null !== rowIndex && rowIndex < insertAtIndex) {
                existingRow.insertAdjacentElement('afterend', rowToInsert);

                return;
            }
        }

        this.tbodyElement.appendChild(rowToInsert);
    }

    private getTabRowByTabId(tabId: number): HTMLTableRowElement {
        return this.tbodyElement.querySelector(`tr[data-tab-id="${tabId}"]`);
    }

    async onTabClose(event: TabClosed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabClose.bind(this, event));
            return;
        }

        await this.handleTabClose(event);
    }

    private async handleTabClose(event: TabClosed) {
        const openedTabRow = this.getTabRowByTabId(event.closedTab.id);

        if (openedTabRow) {
            openedTabRow.remove();
            this.showNoTabRowIfTableIsEmpty();
            this.tabCounter.decrementNumberOfOpenedTabs();
        }
    }

    private showNoTabRowIfTableIsEmpty() {
        if (this.tbodyElement.querySelectorAll('tr:not(.filtered):not(.noTabRow)').length <= 0) {
            this.noTabRow.classList.remove('transparent');
        } else {
            this.noTabRow.classList.add('transparent');
        }
    }

    async onOpenTabMove(event: OpenedTabMoved) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabMode.bind(this, event));
            return;
        }

        await this.handleOpenTabMode(event);
    }

    private async handleOpenTabMode(event: OpenedTabMoved) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.insertRowAtIndex(tabRow, event.tabOpenState.index);
            this.updateTabIndex(tabRow, event.tabOpenState.index);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabFaviconUrlUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabFaviconUrlUpdate(event);
    }

    private async handleOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabTitleUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabTitleUpdate(event);
    }

    private async handleOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabTitle(tabRow, event.tabOpenState.title);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabUrlUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabUrlUpdate(event);
    }

    private async handleOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url, event.tabOpenState.isPrivileged, event.tabOpenState.isIgnored);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabReaderModeStateUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabReaderModeStateUpdate(event);
    }

    private async handleOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
            this.updateTabLastAccess(tabRow, event.tabOpenState.lastAccess);
        }
    }

    async onOpenTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleOpenTabPinStateUpdate.bind(this, event));
            return;
        }

        await this.handleOpenTabPinStateUpdate(event);
    }

    private async handleOpenTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

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
        const tabRow = this.getTabRowByTabId(event.tab.openState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, true);
        }
    }

    async onTabUnfollow(event: TabUnfollowed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.handleTabUnfollow.bind(this, event));
            return;
        } else if (null == event.openState) {
            return;
        }

        await this.handleTabUnfollow(event);
    }

    private async handleTabUnfollow(event: TabUnfollowed) {
        const tabRow = this.getTabRowByTabId(event.openState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, false);
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
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, true);
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
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

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
        while (this.pendingEvents.length > 0) {
            const callback = this.pendingEvents.shift();
            await callback();
        }

        this.pendingEvents = [];
    }
}
