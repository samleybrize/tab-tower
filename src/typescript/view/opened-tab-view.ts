import { TabClosed } from '../tab/event/tab-closed';
import { TabCreated } from '../tab/event/tab-created';
import { TabMoved } from '../tab/event/tab-moved';
import { TabUpdated } from '../tab/event/tab-updated';
import { OpenedTabRetriever } from '../tab/opened-tab-retriever';
import { Tab } from '../tab/tab';

export class OpenedTabView {
    private tbodyElement: HTMLElement;
    private tabList: Tab[];

    constructor(private openedTabRetriever: OpenedTabRetriever, containerElement: HTMLElement) {
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
        this.tabList = await this.openedTabRetriever.getAll();

        this.removeAllTabsFromListElement();

        for (const tab of this.tabList) {
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

    private createTabRow(tab: Tab): HTMLElement {
        const titleCell = this.createTitleCell(tab);
        const faviconCell = this.createFaviconCell(tab);
        const incognitoCell = this.createIncognitoCell(tab);
        const openIndicatorCell = this.createOpenIndicatorCell(tab);
        const followCell = this.createFollowCell(tab);

        const row = document.createElement('tr');
        row.setAttribute('data-index', '' + tab.index);
        row.setAttribute('data-id', '' + tab.id);
        row.appendChild(faviconCell);
        row.appendChild(titleCell);
        row.appendChild(incognitoCell);
        row.appendChild(openIndicatorCell);
        row.appendChild(followCell);

        return row;
    }

    private createTitleCell(tab: Tab): HTMLElement {
        const linkElement = document.createElement('a');
        linkElement.href = tab.url;
        linkElement.target = '_blank';
        linkElement.textContent = tab.title;

        const titleCell = document.createElement('td');
        titleCell.appendChild(linkElement);

        return titleCell;
    }

    private createFaviconCell(tab: Tab): HTMLElement {
        // TODO favicon may not exists, or fail to load (=> show a dotted empty square)
        const faviconImage = document.createElement('img');
        faviconImage.src = tab.faviconUrl;

        const faviconCell = document.createElement('td');
        faviconCell.appendChild(faviconImage);

        return faviconCell;
    }

    private createIncognitoCell(tab: Tab): HTMLElement {
        const incognitoCell = document.createElement('td');
        incognitoCell.textContent = tab.isIncognito ? 'Yes' : 'No';

        return incognitoCell;
    }

    private createOpenIndicatorCell(tab: Tab): HTMLElement {
        const openIndicatorCell = document.createElement('td');
        openIndicatorCell.textContent = tab.isOpened ? 'Yes' : 'No';
        openIndicatorCell.classList.add('opened');

        return openIndicatorCell;
    }

    private createFollowCell(tab: Tab): HTMLElement {
        const followCell = document.createElement('td');

        if (!tab.isFollowed) {
            const registerButton = document.createElement('a');
            registerButton.textContent = 'Follow';
            registerButton.setAttribute('data-tab-id', '' + tab.id);
            registerButton.addEventListener('mouseup', (event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }

                if (null == event.target.getAttribute('data-tab-id')) {
                    console.error('Unable to find a tab id');

                    return;
                }

                tab.isFollowed = true;
                // TODO command: FollowTab
                this.refresh();
            });

            followCell.appendChild(registerButton);
        }

        return followCell;
    }

    onTabCreate(event: TabCreated): Promise<void> {
        this.refresh();

        return;
    }

    onTabClose(event: TabClosed): Promise<void> {
        for (const tab of this.tabList) {
            if (event.tabId == tab.id) {
                const tabRow = this.tbodyElement.querySelector(`tr[data-id='${tab.id}']`);
                tabRow.textContent = 'Closing';
                tabRow.classList.remove('opened');
                tabRow.classList.add('closing');
                tabRow.remove();

                this.markTabAsClosedWhenEffectivellyClosed(tab);

                break;
            }
        }

        return;
    }

    private async markTabAsClosedWhenEffectivellyClosed(tab: Tab) {
        tab.markAsClosing();

        // TODO browser.tabs.get() with setTimeout (+max number of retries?)
        // TODO tab.markAsClosed();
        // TODO update tab indexes
    }

    onTabMove(event: TabMoved): Promise<void> {
        this.refresh();

        return;
    }

    onTabUpdate(event: TabUpdated): Promise<void> {
        this.refresh();

        return;
    }
}
