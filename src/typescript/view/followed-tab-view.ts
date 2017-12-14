import { CommandBus } from '../bus/command-bus';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { OpenTabFaviconUrlUpdated } from '../tab/event/open-tab-favicon-url-updated';
import { OpenTabReaderModeStateUpdated } from '../tab/event/open-tab-reader-mode-state-updated';
import { OpenTabTitleUpdated } from '../tab/event/open-tab-title-updated';
import { OpenTabUrlUpdated } from '../tab/event/open-tab-url-updated';
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
        row.appendChild(faviconCell);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(readerModeCell);
        row.appendChild(openIndicatorCell);
        row.appendChild(followCell);

        return row;
    }

    private createTitleCell(tab: Tab): HTMLElement {
        // TODO click sends to the opened tab
        const linkElement = document.createElement('a');
        linkElement.setAttribute('data-url', tab.followState.url);
        linkElement.textContent = tab.followState.title;

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

    async onTabClose(event: TabClosed): Promise<void> {
        const tabRow = this.getTabRowByOpenTabId(event.tabId);

        if (tabRow) {
            // TODO call createOpenIndicatorCell
            tabRow.querySelector('.openIndicator').textContent = 'No';
        }
    }

    private getTabRowByOpenTabId(openTabId: number): HTMLTableRowElement {
        return this.tbodyElement.querySelector(`tr[data-open-tab-id="${openTabId}"]`);
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated): Promise<void> {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            const faviconElement = tabRow.querySelector('.favicon img') as HTMLImageElement;
            faviconElement.src = event.tabOpenState.faviconUrl;
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated): Promise<void> {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            const linkElement = tabRow.querySelector('.title a');
            linkElement.textContent = event.tabOpenState.title;
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated): Promise<void> {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            const linkElement = tabRow.querySelector('.title a');
            linkElement.setAttribute('data-url', event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated): Promise<void> {
        const tabRow = this.getTabRowByOpenTabId(event.tabOpenState.id);

        if (tabRow) {
            // TODO call createReaderModeCell
            const readerModeElement = tabRow.querySelector('.readerMode');
            readerModeElement.textContent = event.tabOpenState.isInReaderMode ? 'Yes' : 'No';
        }
    }

    async onTabFollow(event: TabFollowed): Promise<void> {
        const row = this.createTabRow(event.tab);
        this.tbodyElement.appendChild(row);

        this.noTabRow.classList.add('transparent');
    }

    async onTabUnfollow(event: TabUnfollowed): Promise<void> {
        const followedTabRow = this.tbodyElement.querySelector(`tr[data-follow-id="${event.oldTabFollowState.id}"]`);

        if (followedTabRow) {
            followedTabRow.remove();
            this.noTabRow.classList.remove('transparent');
        }
    }
}
