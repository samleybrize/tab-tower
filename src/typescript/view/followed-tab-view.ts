import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { CloseTab } from '../tab/command/close-tab';
import { FocusTab } from '../tab/command/focus-tab';
import { OpenTab } from '../tab/command/open-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from '../tab/event/opened-tab-favicon-url-updated';
import { OpenedTabReaderModeStateUpdated } from '../tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { GetFollowedTabs } from '../tab/query/get-followed-tabs';
import { GetTabByFollowId } from '../tab/query/get-tab-by-follow-id';
import { Tab } from '../tab/tab';
import { StringMatcher } from '../utils/string-matcher';
import { TabCounter } from './tab-counter';

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
                    <th class="incognitoIndicator">Incognito</th>
                    <th class="readerModeIndicator">Reader mode</th>
                    <th class="openIndicator">Opened</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    async init() {
        const tabList = await this.queryBus.query(new GetFollowedTabs());
        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);
        let numberOfFollowedTabs = 0;

        for (const tab of tabList) {
            if (!tab.followState) {
                continue;
            }

            const row = this.createTabRow(tab);
            this.tbodyElement.appendChild(row);
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

    private createTabRow(tab: Tab): HTMLElement {
        const row = document.createElement('tr');

        const titleCell = this.createTitleCell(tab, row);
        const incognitoCell = this.createOnOffIndicatorCell('incognitoIndicator');
        const readerModeCell = this.createOnOffIndicatorCell('readerModeIndicator');
        const openIndicatorCell = this.createOnOffIndicatorCell('openIndicator');
        const actionsCell = this.createCell('actions');
        this.addUnfollowButton(actionsCell, tab);
        this.addCloseButton(actionsCell, row);

        row.setAttribute('data-follow-id', '' + tab.followState.id);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(readerModeCell);
        row.appendChild(openIndicatorCell);
        row.appendChild(actionsCell);

        const tabOpenId = tab.openState ? tab.openState.id : null;
        this.updateTabFavicon(row, tab.followState.faviconUrl);
        this.updateTabIncognitoState(row, tab.followState.isIncognito);
        this.updateTabOpenState(row, this.isTabOpened(tab), tabOpenId);
        this.updateTabReaderModeState(row, tab.followState.isInReaderMode);
        this.updateTabTitle(row, tab.followState.title);
        this.updateTabUrl(row, tab.followState.url);

        return row;
    }

    private isTabOpened(tab: Tab) {
        return !!tab.openState;
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

    private createTitleCell(tab: Tab, row: HTMLElement): HTMLElement {
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
                const url = row.getAttribute('data-url');
                const readerMode = !!row.getAttribute('data-reader-mode');
                this.commandBus.handle(new OpenTab(url, readerMode, tab.followState.id));
            }
        });
        linkElement.querySelector('img').addEventListener('error', (event) => {
            (event.target as HTMLImageElement).src = this.defaultFaviconUrl;
        });

        const cell = this.createCell('title');
        cell.appendChild(linkElement);

        return cell;
    }

    private addUnfollowButton(cell: HTMLElement, tab: Tab) {
        const unfollowButton = document.createElement('a');
        unfollowButton.textContent = 'Unfollow';
        unfollowButton.setAttribute('data-tooltip', 'Please double click to unfollow this tab');
        unfollowButton.classList.add('unfollowButton');
        unfollowButton.classList.add('btn');
        unfollowButton.classList.add('waves-effect');
        unfollowButton.classList.add('waves-light');
        jQuery(unfollowButton).tooltip();

        unfollowButton.addEventListener('dblclick', async (event) => {
            const upToDateTab = await this.queryBus.query(new GetTabByFollowId(tab.followState.id));
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });

        cell.appendChild(unfollowButton);
    }

    private addCloseButton(cell: HTMLElement, row: HTMLElement) {
        const closeButton = document.createElement('a');
        closeButton.textContent = 'Close';
        closeButton.classList.add('closeButton');
        closeButton.classList.add('btn');
        closeButton.classList.add('waves-effect');
        closeButton.classList.add('waves-light');
        closeButton.classList.add('transparent');

        closeButton.addEventListener('click', async (event) => {
            const openId = row.getAttribute('data-opened-tab-id');

            if (null === openId || '' === openId) {
                return;
            }

            this.commandBus.handle(new CloseTab(+openId));
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

    private updateTabUrl(row: HTMLElement, url: string) {
        row.setAttribute('data-url', '' + url);
        row.querySelector('.title a').setAttribute('data-url', '' + url);
    }

    private updateTabOpenState(row: HTMLElement, isOpened: boolean, tabId: number) {
        row.setAttribute('data-opened-tab-id', '' + tabId);
        const titleCell = row.querySelector('.title');

        const closeButton = row.querySelector('.closeButton');
        this.updateOnOffIndicator(isOpened, row.querySelector('.openIndicator'));

        if (isOpened) {
            closeButton.classList.remove('transparent');
            titleCell.setAttribute('data-tooltip', 'Go to tab');
        } else {
            titleCell.setAttribute('data-tooltip', 'Open tab');
            closeButton.classList.add('transparent');
        }

        jQuery(titleCell).tooltip();
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

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        this.updateOnOffIndicator(isInReaderMode, row.querySelector('.readerModeIndicator'));
    }

    private updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        this.updateOnOffIndicator(isIncognito, row.querySelector('.incognitoIndicator'));
    }

    show() {
        this.containerElement.classList.add('show');
    }

    hide() {
        this.containerElement.classList.remove('show');
    }

    async onTabClose(event: TabClosed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.onTabClose.bind(this, event));
            return;
        }

        const tabRow = this.getTabRowByOpenTabId(event.tabId);

        if (tabRow) {
            tabRow.removeAttribute('data-opened-tab-id');
            const followId = tabRow.getAttribute('data-follow-id');
            const upToDateTab = await this.queryBus.query(new GetTabByFollowId(followId));
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
            this.pendingEvents.push(this.onOpenTabFaviconUrlUpdate.bind(this, event));
            return;
        }

        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.onOpenTabTitleUpdate.bind(this, event));
            return;
        }

        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabTitle(tabRow, event.tabOpenState.title);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.onOpenTabUrlUpdate.bind(this, event));
            return;
        }

        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.onOpenTabReaderModeStateUpdate.bind(this, event));
            return;
        }

        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
        }
    }

    async onTabFollow(event: TabFollowed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.onTabFollow.bind(this, event));
            return;
        }

        const row = this.createTabRow(event.tab);
        this.tbodyElement.appendChild(row);

        this.noTabRow.classList.add('transparent');
        this.applyTabFilter();
        this.tabCounter.incrementNumberOfFollowedTabs();
    }

    async onTabUnfollow(event: TabUnfollowed) {
        if (this.isEventHandlingNotReady()) {
            this.pendingEvents.push(this.onTabUnfollow.bind(this, event));
            return;
        }

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
            this.pendingEvents.push(this.onAssociateOpenedTabToFollowedTab.bind(this, event));
            return;
        }

        const followedTabRow: HTMLElement = this.tbodyElement.querySelector(`tr[data-follow-id="${event.tabFollowState.id}"]`);

        if (followedTabRow) {
            this.updateTabFavicon(followedTabRow, event.tabOpenState.faviconUrl);
            this.updateTabIncognitoState(followedTabRow, event.tabOpenState.isIncognito);
            this.updateTabOpenState(followedTabRow, true, event.tabOpenState.id);
            this.updateTabReaderModeState(followedTabRow, event.tabOpenState.isInReaderMode);
            this.updateTabTitle(followedTabRow, event.tabOpenState.title);
            this.updateTabUrl(followedTabRow, event.tabOpenState.url);
            followedTabRow.removeAttribute('data-is-opening-tab');
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
