import { CommandBus } from '../bus/command-bus';
import { OpenTabFaviconUrlUpdated } from '../tab/event/open-tab-favicon-url-updated';
import { OpenTabTitleUpdated } from '../tab/event/open-tab-title-updated';
import { OpenTabUrlUpdated } from '../tab/event/open-tab-url-updated';
import { TabClosed } from '../tab/event/tab-closed';
import { TabFollowed } from '../tab/event/tab-followed';
import { Tab } from '../tab/tab';
import { TabRetriever } from '../tab/tab-retriever';

export class FollowedTabView {
    private tbodyElement: HTMLElement;

    constructor(
        private tabRetriever: TabRetriever,
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
                <th>Opened</th>
                <th></th>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    async init() {
        const tabList = await this.tabRetriever.getFollowedTabs();

        this.removeAllTabsFromListElement();

        if (0 == tabList.length) {
            this.addNoTabRow();

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

    private removeAllTabsFromListElement() {
        while (this.tbodyElement.firstChild) {
            this.tbodyElement.removeChild(this.tbodyElement.firstChild);
        }
    }

    private addNoTabRow() {
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '5');
        cell.textContent = 'No tab';

        const row = document.createElement('tr');
        row.appendChild(cell);
        this.tbodyElement.appendChild(row);
    }

    private createTabRow(tab: Tab): HTMLElement {
        const titleCell = this.createTitleCell(tab);
        const faviconCell = this.createFaviconCell(tab);
        const incognitoCell = this.createIncognitoCell(tab);
        const openIndicatorCell = this.createOpenIndicatorCell(tab);
        const followCell = this.createFollowCell(tab);

        const tabId = tab.isOpened ? tab.openState.id : null;
        const row = document.createElement('tr');
        row.setAttribute('data-open-tab-id', '' + tabId);
        row.setAttribute('data-follow-id', '' + tab.followState.id);
        row.appendChild(faviconCell);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
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

    private createOpenIndicatorCell(tab: Tab): HTMLElement {
        const openIndicatorCell = document.createElement('td');
        openIndicatorCell.textContent = tab.isOpened ? 'Yes' : 'No';
        openIndicatorCell.classList.add('opened');
        openIndicatorCell.classList.add('openIndicator');

        return openIndicatorCell;
    }

    private createFollowCell(tab: Tab): HTMLElement {
        const followCell = document.createElement('td');

        const tabId = tab.isOpened ? tab.openState.id : null;
        const registerButton = document.createElement('a');
        registerButton.textContent = 'Unfollow';
        registerButton.setAttribute('data-open-tab-id', '' + tabId);
        registerButton.setAttribute('data-follow-id', '' + tab.followState.id);
        registerButton.addEventListener('mouseup', (event) => {
            if (!(event.target instanceof Element)) {
                return;
            }

            if (null == event.target.getAttribute('data-tab-id')) {
                console.error('Unable to find a tab id');

                return;
            }

            // this.commandBus.handle(new UnfollowTab(tab));
        });

        followCell.appendChild(registerButton);

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

    async onTabFollow(event: TabFollowed): Promise<void> {
        const row = this.createTabRow(event.tab);
        this.tbodyElement.appendChild(row);
    }
}
