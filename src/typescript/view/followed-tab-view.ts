import { CommandBus } from '../bus/command-bus';
import { OpenTabMoved } from '../tab/event/open-tab-moved';
import { OpenTabUpdated } from '../tab/event/open-tab-updated';
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

    async refresh() {
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
        row.setAttribute('data-index', '' + tabId);
        row.setAttribute('data-id', '' + tab.followState.id);
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
        linkElement.href = tab.followState.url;
        linkElement.textContent = tab.followState.title;

        const titleCell = document.createElement('td');
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
        registerButton.setAttribute('data-tab-id', '' + tabId);
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

    onTabClose(event: TabClosed): Promise<void> {
        // TODO
        this.refresh();

        return;
    }

    onOpenTabMove(event: OpenTabMoved): Promise<void> {
        // TODO
        this.refresh();

        return;
    }

    onOpenTabUpdate(event: OpenTabUpdated): Promise<void> {
        // TODO
        this.refresh();

        return;
    }

    onTabFollow(event: TabFollowed): Promise<void> {
        // TODO
        this.refresh();

        return;
    }
}
