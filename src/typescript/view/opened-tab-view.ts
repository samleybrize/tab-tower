import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { CloseTab } from '../tab/command/close-tab';
import { FocusTab } from '../tab/command/focus-tab';
import { FollowTab } from '../tab/command/follow-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from '../tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../tab/event/opened-tab-focused';
import { OpenedTabMoved } from '../tab/event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from '../tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabOpened } from '../tab/event/tab-opened';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { GetOpenedTabs } from '../tab/query/get-opened-tabs';
import { GetTabByOpenId } from '../tab/query/get-tab-by-open-id';
import { Tab } from '../tab/tab';
import { TabOpenState } from '../tab/tab-open-state';
import { StringMatcher } from '../utils/string-matcher';
import { TabCounter } from './tab-counter';

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
                    <th class="incognitoIndicator">Incognito</th>
                    <th class="readerModeIndicator">Reader mode</th>
                    <th class="lastAccess">Last access</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    async init() {
        const tabList = await this.queryBus.query(new GetOpenedTabs());
        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);
        let numberOfOpenedTabs = 0;

        for (const tab of tabList) {
            if (!tab.openState) {
                continue;
            }

            const row = this.createTabRow(tab.openState, this.isTabFollowed(tab));
            this.tbodyElement.appendChild(row);
            numberOfOpenedTabs++;
        }

        this.isInitDone = true;
        this.tabCounter.setNumberOfOpenedTabs(numberOfOpenedTabs);
        await this.playPendingEvents();
        this.applyTabFilter();
        this.showNoTabRowIfTableIsEmpty();
    }

    private isTabFollowed(tab: Tab) {
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
        const incognitoCell = this.createOnOffIndicatorCell('incognitoIndicator');
        const readerModeCell = this.createOnOffIndicatorCell('readerModeIndicator');
        const lastAccessCell = this.createCell('lastAccess');
        const actionsCell = this.createCell('actions');
        this.addFollowButton(actionsCell, tabOpenState);
        this.addUnfollowButton(actionsCell, tabOpenState);
        this.addCloseButton(actionsCell, tabOpenState);

        row.setAttribute('data-tab-id', '' + tabOpenState.id);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(readerModeCell);
        row.appendChild(lastAccessCell);
        row.appendChild(actionsCell);

        this.updateTabFavicon(row, tabOpenState.faviconUrl);
        this.updateTabIncognitoState(row, tabOpenState.isIncognito);
        this.updateTabIndex(row, tabOpenState.index);
        this.updateTabReaderModeState(row, tabOpenState.isInReaderMode);
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

    private createOnOffIndicatorCell(className?: string) {
        const cell = this.createCell(className);
        cell.innerHTML = `
            <div>
                <i class="material-icons off">highlight_off</i>
                <i class="material-icons on">check_circle</i>
            </div>
        `;

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

    private addFollowButton(cell: HTMLElement, tabOpenState: TabOpenState) {
        const followButton = document.createElement('a');
        followButton.textContent = 'Follow';
        followButton.classList.add('followButton');
        followButton.classList.add('btn');
        followButton.classList.add('waves-effect');
        followButton.classList.add('waves-light');

        followButton.addEventListener('click', async (event) => {
            if (followButton.classList.contains('disabled')) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabByOpenId(tabOpenState.id));
            this.commandBus.handle(new FollowTab(upToDateTab));
        });

        cell.appendChild(followButton);
    }

    private addUnfollowButton(cell: HTMLElement, tabOpenState: TabOpenState) {
        const unfollowButton = document.createElement('a');
        unfollowButton.textContent = 'Unfollow';
        unfollowButton.setAttribute('data-tooltip', 'Please double click to unfollow this tab');
        unfollowButton.classList.add('unfollowButton');
        unfollowButton.classList.add('btn');
        unfollowButton.classList.add('waves-effect');
        unfollowButton.classList.add('waves-light');
        jQuery(unfollowButton).tooltip();

        unfollowButton.addEventListener('dblclick', async (event) => {
            if (unfollowButton.classList.contains('disabled')) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabByOpenId(tabOpenState.id));
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });

        cell.appendChild(unfollowButton);
    }

    private addCloseButton(cell: HTMLElement, tabOpenState: TabOpenState) {
        const closeButton = document.createElement('a');
        closeButton.textContent = 'Close';
        closeButton.classList.add('closeButton');
        closeButton.classList.add('btn');
        closeButton.classList.add('waves-effect');
        closeButton.classList.add('waves-light');

        closeButton.addEventListener('click', async (event) => {
            if (closeButton.classList.contains('disabled')) {
                return;
            }

            this.commandBus.handle(new CloseTab(tabOpenState.id));
        });

        cell.appendChild(closeButton);
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
            row.querySelector('.lastAccess').innerHTML = lastAccess.toLocaleString(); // TODO use moment
        }
    }

    private updateTabIndex(row: HTMLElement, index: number) {
        row.setAttribute('data-index', '' + index);
    }

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        this.updateOnOffIndicator(isInReaderMode, row.querySelector('.readerModeIndicator'));
    }

    private updateOnOffIndicator(isOn: boolean, cell: HTMLElement) {
        const iconOnElement = cell.querySelector('.on');
        const iconOffElement = cell.querySelector('.off');

        if (isOn) {
            iconOnElement.classList.remove('transparent');
            iconOffElement.classList.add('transparent');
        } else {
            iconOnElement.classList.add('transparent');
            iconOffElement.classList.remove('transparent');
        }
    }

    private updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        this.updateOnOffIndicator(isIncognito, row.querySelector('.incognitoIndicator'));
    }

    private updateFollowState(row: HTMLElement, isFollowed: boolean) {
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

            return;
        }

        this.insertRowAtIndex(rowToInsert, event.tabOpenState.index);
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
