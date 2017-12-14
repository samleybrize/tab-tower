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
                <th></th>
                <th>Title</th>
                <th>Incognito</th>
                <th>Reader mode</th>
                <th>Opened</th>
                <th></th>
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
        const titleCell = this.createTitleCell(tab);
        const faviconCell = this.createFaviconCell(tab);
        const incognitoCell = this.createIncognitoCell(tab);
        const readerModeCell = this.createReaderModeCell(tab);
        const openIndicatorCell = this.createOpenIndicatorCell(tab);
        const followCell = this.createUnfollowCell(tab);

        const tabId = tab.isOpened ? tab.openState.id : null;
        const row = document.createElement('tr');
        row.setAttribute('data-open-tab-id', '' + tabId);
        row.setAttribute('data-follow-id', '' + tab.followState.id);
        row.setAttribute('data-url', '' + tab.followState.url);
        row.setAttribute('data-reader-mode', tab.followState.isInReaderMode ? '1' : '');
        row.appendChild(faviconCell);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(readerModeCell);
        row.appendChild(openIndicatorCell);
        row.appendChild(followCell);

        return row;
    }

    private createTitleCell(tab: Tab): HTMLElement {
        const linkElement = document.createElement('a');
        linkElement.setAttribute('data-url', tab.followState.url);
        linkElement.textContent = tab.followState.title;
        linkElement.addEventListener('mouseup', (event) => {
            const row = this.tbodyElement.querySelector(`tr[data-follow-id="${tab.followState.id}"]`);
            const openTabId = +row.getAttribute('data-open-tab-id');

            if (openTabId) {
                this.commandBus.handle(new FocusTab(openTabId));
            } else {
                const url = row.getAttribute('data-url');
                const readerMode = !!row.getAttribute('data-reader-mode');
                this.commandBus.handle(new OpenTab(url, readerMode, tab.followState.id));
            }
        });

        const titleCell = document.createElement('td');
        titleCell.classList.add('title');
        titleCell.appendChild(linkElement);

        return titleCell;
    }

    private createFaviconCell(tab: Tab): HTMLElement {
        const faviconImage = document.createElement('img');

        if (null == tab.followState.faviconUrl) {
            faviconImage.src = this.defaultFaviconUrl;
        } else {
            faviconImage.src = tab.followState.faviconUrl;
            faviconImage.addEventListener('error', (event) => {
                faviconImage.src = this.defaultFaviconUrl;
            });
        }

        const faviconCell = document.createElement('td');
        faviconCell.classList.add('favicon');
        faviconCell.appendChild(faviconImage);

        return faviconCell;
    }

    private createIncognitoCell(tab: Tab): HTMLElement {
        const incognitoCell = document.createElement('td');
        incognitoCell.textContent = tab.followState.isIncognito ? 'Yes' : 'No';
        incognitoCell.classList.add('incognito');

        return incognitoCell;
    }

    private createReaderModeCell(tab: Tab): HTMLElement {
        const readerModeCell = document.createElement('td');
        readerModeCell.textContent = tab.followState.isInReaderMode ? 'Yes' : 'No';
        readerModeCell.classList.add('readerMode');

        return readerModeCell;
    }

    private createOpenIndicatorCell(tab: Tab): HTMLElement {
        const openIndicatorCell = document.createElement('td');
        openIndicatorCell.textContent = tab.isOpened ? 'Yes' : 'No';
        openIndicatorCell.classList.add('opened');
        openIndicatorCell.classList.add('openIndicator');

        return openIndicatorCell;
    }

    private createUnfollowCell(tab: Tab): HTMLElement {
        const followCell = document.createElement('td');

        const tabId = tab.isOpened ? tab.openState.id : null;
        const unfollowButton = document.createElement('a');
        unfollowButton.textContent = 'Unfollow';
        unfollowButton.setAttribute('data-follow-id', '' + tab.followState.id);
        unfollowButton.addEventListener('mouseup', (event) => {
            if (!(event.target instanceof Element)) {
                return;
            }

            this.commandBus.handle(new UnfollowTab(tab));
        });

        followCell.appendChild(unfollowButton);

        return followCell;
    }

    async onTabClose(event: TabClosed) {
        const tabRow = this.getTabRowByOpenTabId(event.tabId);

        if (tabRow) {
            // TODO call createOpenIndicatorCell
            tabRow.querySelector('.openIndicator').textContent = 'No';
            tabRow.setAttribute('data-open-tab-id', '');
        }
    }

    private getTabRowByOpenTabId(openTabId: number): HTMLTableRowElement {
        return this.tbodyElement.querySelector(`tr[data-open-tab-id="${openTabId}"]`);
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            const faviconElement = tabRow.querySelector('.favicon img') as HTMLImageElement;
            faviconElement.src = event.tabOpenState.faviconUrl;
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            const linkElement = tabRow.querySelector('.title a');
            linkElement.textContent = event.tabOpenState.title;
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            const linkElement = tabRow.querySelector('.title a');
            linkElement.setAttribute('data-url', event.tabOpenState.url);

            tabRow.setAttribute('data-url', '' + event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated) {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            // TODO call createReaderModeCell
            const readerModeElement = tabRow.querySelector('.readerMode');
            readerModeElement.textContent = event.tabOpenState.isInReaderMode ? 'Yes' : 'No';

            tabRow.setAttribute('data-reader-mode', event.tabOpenState.isInReaderMode ? '1' : '');
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
            this.noTabRow.classList.remove('transparent');
        }
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followedTabRow = this.tbodyElement.querySelector(`tr[data-follow-id="${event.tabFollowState.id}"]`);

        if (followedTabRow) {
            followedTabRow.setAttribute('data-open-tab-id', '' + event.tabOpenState.id);
            followedTabRow.setAttribute('data-url', '' + event.tabOpenState.url);
            followedTabRow.setAttribute('data-reader-mode', event.tabOpenState.isInReaderMode ? '1' : '');

            (followedTabRow.querySelector('.favicon img') as HTMLImageElement).src = event.tabOpenState.faviconUrl;
            (followedTabRow.querySelector('.readerMode') as HTMLImageElement).textContent = event.tabOpenState.isInReaderMode ? 'Yes' : 'No';
            (followedTabRow.querySelector('.incognito') as HTMLImageElement).textContent = event.tabOpenState.isIncognito ? 'Yes' : 'No';
            (followedTabRow.querySelector('.openIndicator') as HTMLImageElement).textContent = 'Yes';

            const titleElement = followedTabRow.querySelector('.title a') as HTMLImageElement;
            titleElement.textContent = event.tabOpenState.title;
            titleElement.setAttribute('data-url', event.tabOpenState.url);
        }
    }
}
