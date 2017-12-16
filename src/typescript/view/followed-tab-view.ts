import { CommandBus } from '../bus/command-bus';
import { FocusTab } from '../tab/command/focus-tab';
import { OpenTab } from '../tab/command/open-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { OpenTabFaviconUrlUpdated } from '../tab/event/open-tab-favicon-url-updated';
import { OpenTabReaderModeStateUpdated } from '../tab/event/open-tab-reader-mode-state-updated';
import { OpenTabTitleUpdated } from '../tab/event/open-tab-title-updated';
import { OpenTabUrlUpdated } from '../tab/event/open-tab-url-updated';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { Tab } from '../tab/tab';
import { TabRetriever } from '../tab/tab-retriever';

export class FollowedTabView {
    private tbodyElement: HTMLElement;
    private noTabRow: HTMLElement;

    constructor(
        private tabRetriever: TabRetriever,
        private commandBus: CommandBus,
        containerElement: HTMLElement,
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
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Incognito</th>
                    <th>Reader mode</th>
                    <th>Opened</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    async init() {
        const tabList = await this.tabRetriever.getFollowedTabs();
        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);

        if (0 == tabList.length) {
            this.noTabRow.classList.remove('transparent');

            return;
        }

        for (const tab of tabList) {
            if (!tab.isOpened) {
                continue;
            }

            const row = this.createTabRow(tab);
            this.tbodyElement.appendChild(row);
        }
    }

    private createNoTabRow() {
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '5');
        cell.textContent = 'No tab';

        const row = document.createElement('tr');
        row.classList.add('transparent');
        row.classList.add('noTabRow');
        row.appendChild(cell);

        return row;
    }

    private createTabRow(tab: Tab): HTMLElement {
        const row = document.createElement('tr');

        const titleCell = this.createTitleCell(tab, row);
        const incognitoCell = this.createCell('incognitoIndicator');
        const readerModeCell = this.createCell('readerModeIndicator');
        const openIndicatorCell = this.createCell('openIndicator');
        const actionsCell = this.createCell('actions');
        this.addUnfollowButton(actionsCell, tab);

        row.setAttribute('data-follow-id', '' + tab.followState.id);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(readerModeCell);
        row.appendChild(openIndicatorCell);
        row.appendChild(actionsCell);

        const tabOpenId = tab.isOpened ? tab.openState.id : null;
        this.updateTabFavicon(row, tab.followState.faviconUrl);
        this.updateTabIncognitoState(row, tab.followState.isIncognito);
        this.updateTabOpenState(row, tab.isOpened, tabOpenId);
        this.updateTabReaderModeState(row, tab.followState.isInReaderMode);
        this.updateTabTitle(row, tab.followState.title);
        this.updateTabUrl(row, tab.followState.url);

        return row;
    }

    private createCell(className?: string): HTMLElement {
        const cell = document.createElement('td');

        if (className) {
            cell.classList.add(className);
        }

        return cell;
    }

    private createTitleCell(tab: Tab, row: HTMLElement): HTMLElement {
        const linkElement = document.createElement('a');
        linkElement.innerHTML = `
            <img />
            <span></span>
        `;
        linkElement.addEventListener('mouseup', (event) => {
            const openTabId = +row.getAttribute('data-open-tab-id');

            if (openTabId) {
                this.commandBus.handle(new FocusTab(openTabId));
            } else {
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
        unfollowButton.addEventListener('mouseup', async (event) => {
            const upToDateTab = await this.tabRetriever.getByFollowId(tab.followState.id);
            this.commandBus.handle(new UnfollowTab(upToDateTab));
        });

        cell.appendChild(unfollowButton);
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
        row.setAttribute('data-open-tab-id', '' + tabId);
        row.querySelector('.openIndicator').textContent = isOpened ? 'Yes' : 'No';
    }

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');
        row.querySelector('.readerModeIndicator').textContent = isInReaderMode ? 'Yes' : 'No';
    }

    private updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        row.querySelector('.incognitoIndicator').textContent = isIncognito ? 'Yes' : 'No';
    }

    async onTabClose(event: TabClosed) {
        const tabRow = this.getTabRowByOpenTabId(event.tabId);

        if (tabRow) {
            this.updateTabOpenState(tabRow, false, null);
        }
    }

    private getTabRowByOpenTabId(openTabId: number): HTMLTableRowElement {
        return this.tbodyElement.querySelector(`tr[data-open-tab-id="${openTabId}"]`);
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabTitle(tabRow, event.tabOpenState.title);
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
        }
    }

    async onTabFollow(event: TabFollowed) {
        const row = this.createTabRow(event.tab);
        this.tbodyElement.appendChild(row);

        this.noTabRow.classList.add('transparent');
    }

    async onTabUnfollow(event: TabUnfollowed) {
        const followedTabRow = this.tbodyElement.querySelector(`tr[data-follow-id="${event.oldTabFollowState.id}"]`);

        if (followedTabRow) {
            followedTabRow.remove();
            this.showNoTabRowIfTableIsEmpty();
        }
    }

    private showNoTabRowIfTableIsEmpty() {
        if (this.tbodyElement.querySelectorAll('tr').length <= 1) {
            this.noTabRow.classList.remove('transparent');
        }
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followedTabRow: HTMLElement = this.tbodyElement.querySelector(`tr[data-follow-id="${event.tabFollowState.id}"]`);

        if (followedTabRow) {
            this.updateTabFavicon(followedTabRow, event.tabOpenState.faviconUrl);
            this.updateTabIncognitoState(followedTabRow, event.tabOpenState.isIncognito);
            this.updateTabOpenState(followedTabRow, true, event.tabOpenState.id);
            this.updateTabReaderModeState(followedTabRow, event.tabOpenState.isInReaderMode);
            this.updateTabTitle(followedTabRow, event.tabOpenState.title);
            this.updateTabUrl(followedTabRow, event.tabOpenState.url);
        }
    }
}
