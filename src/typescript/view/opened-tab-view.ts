import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { FocusTab } from '../tab/command/focus-tab';
import { FollowTab } from '../tab/command/follow-tab';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from '../tab/event/opened-tab-favicon-url-updated';
import { OpenedTabMoved } from '../tab/event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from '../tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFollowed } from '../tab/event/tab-followed';
import { TabOpened } from '../tab/event/tab-opened';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { GetOpenedTabs } from '../tab/query/get-opened-tabs';
import { GetTabByOpenId } from '../tab/query/get-tab-by-open-id';
import { Tab } from '../tab/tab';
import { TabOpenState } from '../tab/tab-open-state';

export class OpenedTabView {
    private tbodyElement: HTMLElement;
    private noTabRow: HTMLElement;

    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
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
        table.classList.add('bordered');
        table.classList.add('highlight');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th class="incognitoIndicator">Incognito</th>
                    <th class="readerModeIndicator">Reader mode</th>
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

        if (0 == tabList.length) {
            this.noTabRow.classList.remove('transparent');

            return;
        }

        for (const tab of tabList) {
            if (!tab.openState) {
                continue;
            }

            const row = this.createTabRow(tab.openState, this.isTabFollowed(tab));
            this.tbodyElement.appendChild(row);
        }
    }

    private isTabFollowed(tab: Tab) {
        return !!tab.followState;
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
        const incognitoCell = this.createMaterialIconCell('incognitoIndicator');
        const readerModeCell = this.createMaterialIconCell('readerModeIndicator');
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
        this.updateTabUrl(row, tabOpenState.url, tabOpenState.isPrivileged);
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

    private createMaterialIconCell(className?: string) {
        const cell = this.createCell(className);
        cell.innerHTML = '<i class="material-icons"></i>';

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
        unfollowButton.classList.add('unfollowButton');
        unfollowButton.classList.add('btn');
        unfollowButton.classList.add('waves-effect');
        unfollowButton.classList.add('waves-light');

        unfollowButton.addEventListener('click', async (event) => {
            if (unfollowButton.classList.contains('disabled')) {
                return;
            }

            const upToDateTab = await this.queryBus.query(new GetTabByOpenId(tabOpenState.id));
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

    private updateTabUrl(row: HTMLElement, url: string, isPrivileged: boolean) {
        row.setAttribute('data-url', '' + url);
        row.querySelector('.title a').setAttribute('data-url', '' + url);

        const followButton = row.querySelector('.followButton');
        const unfollowButton = row.querySelector('.unfollowButton');

        if (isPrivileged) {
            followButton.classList.add('disabled');
            unfollowButton.classList.add('disabled');
        } else {
            followButton.classList.remove('disabled');
            unfollowButton.classList.remove('disabled');
        }
    }

    private updateTabIndex(row: HTMLElement, index: number) {
        row.setAttribute('data-index', '' + index);
    }

    private updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        const iconElement = row.querySelector('.readerModeIndicator i');
        iconElement.textContent = isInReaderMode ? 'check_circle' : 'highlight_off';

        if (isInReaderMode) {
            iconElement.classList.add('yes');
        } else {
            iconElement.classList.remove('yes');
        }
    }

    private updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        const iconElement = row.querySelector('.incognitoIndicator i');
        iconElement.textContent = isIncognito ? 'check_circle' : 'highlight_off';

        if (isIncognito) {
            iconElement.classList.add('yes');
        } else {
            iconElement.classList.remove('yes');
        }
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

    async onOpenTabMove(event: OpenedTabMoved) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.insertRowAtIndex(tabRow, event.tabOpenState.index);
            this.updateTabIndex(tabRow, event.tabOpenState.index);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabFavicon(tabRow, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabTitle(tabRow, event.tabOpenState.title);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const tabRow = this.getTabRowByTabId(event.tabOpenState.id);

        if (tabRow) {
            this.updateTabUrl(tabRow, event.tabOpenState.url, event.tabOpenState.isPrivileged);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
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
        const tabRow = this.getTabRowByTabId(event.openState.id);

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
