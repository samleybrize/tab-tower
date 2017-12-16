import { CommandBus } from '../bus/command-bus';
import { FocusTab } from '../tab/command/focus-tab';
import { FollowTab } from '../tab/command/follow-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { OpenTabFaviconUrlUpdated } from '../tab/event/open-tab-favicon-url-updated';
import { OpenTabMoved } from '../tab/event/open-tab-moved';
import { OpenTabReaderModeStateUpdated } from '../tab/event/open-tab-reader-mode-state-updated';
import { OpenTabTitleUpdated } from '../tab/event/open-tab-title-updated';
import { OpenTabUrlUpdated } from '../tab/event/open-tab-url-updated';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabOpened } from '../tab/event/tab-opened';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { TabOpenState } from '../tab/tab-open-state';
import { TabRetriever } from '../tab/tab-retriever';

export class OpenedTabView {
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
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    async init() {
        const tabList = await this.tabRetriever.getOpenedTabs();
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

            const row = this.createTabRow(tab.openState, tab.isFollowed);
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

    private createTabRow(tabOpenState: TabOpenState, isFollowed: boolean): HTMLElement {
        const row = document.createElement('tr');

        const titleCell = this.createTitleCell(row);
        const incognitoCell = this.createCell('incognitoIndicator');
        const readerModeCell = this.createCell('readerModeIndicator');
        const actionsCell = this.createCell('actions');
        this.addFollowButton(actionsCell, tabOpenState);
        this.addUnfollowButton(actionsCell, tabOpenState);

        row.setAttribute('data-tab-id', '' + tabOpenState.id);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(readerModeCell);
        row.appendChild(actionsCell);

        this.updateTabFavicon(row, tabOpenState.faviconUrl);
        this.updateTabIncognitoState(row, tabOpenState.isIncognito);
        this.updateTabIndex(row, tabOpenState.index);
        this.updateTabReaderModeState(row, tabOpenState.isInReaderMode);
        this.updateTabTitle(row, tabOpenState.title);
        this.updateTabUrl(row, tabOpenState.url);
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
        cell.appendChild(linkElement);

        return cell;
    }

    private addFollowButton(cell: HTMLElement, tabOpenState: TabOpenState) {
        const followButton = document.createElement('a');
        followButton.textContent = 'Follow';
        followButton.classList.add('followButton');
        followButton.addEventListener('click', async (event) => {
            const upToDateTab = await this.tabRetriever.getByOpenId(tabOpenState.id);
            this.commandBus.handle(new FollowTab(upToDateTab));
        });

        cell.appendChild(followButton);
    }

    private addUnfollowButton(cell: HTMLElement, tabOpenState: TabOpenState) {
        const unfollowButton = document.createElement('a');
        unfollowButton.textContent = 'Unfollow';
        unfollowButton.classList.add('unfollowButton');
        unfollowButton.addEventListener('click', async (event) => {
            const upToDateTab = await this.tabRetriever.getByOpenId(tabOpenState.id);
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

    private updateTabIndex(row: HTMLElement, index: number) {
        row.setAttribute('data-index', '' + index);
    }

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');
        row.querySelector('.readerModeIndicator').textContent = isInReaderMode ? 'Yes' : 'No';
    }

    private updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        row.querySelector('.incognitoIndicator').textContent = isIncognito ? 'Yes' : 'No';
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

    async onTabOpen(event: TabOpened) {
        const rowToInsert = this.createTabRow(event.tabOpenState, false);

        if (0 == event.tabOpenState.index) {
            this.noTabRow.insertAdjacentElement('afterend', rowToInsert);

            return;
        }

        this.insertRowAtIndex(rowToInsert, event.tabOpenState.index);
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
        const openedTabRow = this.getTabRowByTabId(event.tabId);

        if (openedTabRow) {
            openedTabRow.remove();
            this.showNoTabRowIfTableIsEmpty();
        }
    }

    private showNoTabRowIfTableIsEmpty() {
        if (this.tbodyElement.querySelectorAll('tr').length <= 1) {
            this.noTabRow.classList.remove('transparent');
        } else {
            this.noTabRow.classList.add('transparent');
        }
    }

    async onOpenTabMove(event: OpenTabMoved) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.insertRowAtIndex(tabRow, event.tabOpenState.index);
            this.updateTabIndex(tabRow, event.tabOpenState.index);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabTitle(tabRow, event.tabOpenState.title);
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabReaderModeState(tabRow, event.tabOpenState.isInReaderMode);
        }
    }

    async onTabFollow(event: TabFollowed) {
        const tabRow = this.getTabRowByTabId(event.tab.openState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, true);
        }
    }

    async onTabUnfollow(event: TabUnfollowed) {
        const tabRow = this.getTabRowByTabId(event.tab.openState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, false);
        }
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateFollowState(tabRow, true);
        }
    }
}
