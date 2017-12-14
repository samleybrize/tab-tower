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
import { Tab } from '../tab/tab';
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

    async refresh() {
        const tabList = await this.tabRetriever.getOpenedTabs();

        this.removeAllTabsFromListElement();
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

    private removeAllTabsFromListElement() {
        while (this.tbodyElement.firstChild) {
            this.tbodyElement.removeChild(this.tbodyElement.firstChild);
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
        const followCell = this.createFollowCell(tab);

        const row = document.createElement('tr');
        row.setAttribute('data-index', '' + tab.openState.index);
        row.setAttribute('data-id', '' + tab.openState.id);
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
        linkElement.setAttribute('data-url', tab.openState.url);
        linkElement.setAttribute('title', tab.openState.url);
        linkElement.textContent = tab.openState.title;
        linkElement.addEventListener('mouseup', (event) => {
            this.commandBus.handle(new FocusTab(tab.openState.id));
        });

        const titleCell = document.createElement('td');
        titleCell.classList.add('title');
        titleCell.appendChild(linkElement);

        return titleCell;
    }

    private createFaviconCell(tab: Tab): HTMLElement {
        const faviconImage = document.createElement('img');

        if (null == tab.openState.faviconUrl) {
            faviconImage.src = this.defaultFaviconUrl;
        } else {
            faviconImage.src = tab.openState.faviconUrl;
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
        incognitoCell.classList.add('incognito');
        incognitoCell.textContent = tab.openState.isIncognito ? 'Yes' : 'No';

        return incognitoCell;
    }

    private createReaderModeCell(tab: Tab): HTMLElement {
        const readerModeCell = document.createElement('td');
        readerModeCell.classList.add('readerMode');
        readerModeCell.textContent = tab.openState.isInReaderMode ? 'Yes' : 'No';

        return readerModeCell;
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
        followCell.classList.add('follow');

        if (!tab.isFollowed) {
            const followButton = document.createElement('a');
            followButton.textContent = 'Follow';
            followButton.setAttribute('data-tab-id', '' + tab.openState.id);
            followButton.addEventListener('mouseup', (event) => {
                this.commandBus.handle(new FollowTab(tab));
            });

            followCell.appendChild(followButton);
        } else {
            const followButton = document.createElement('a');
            followButton.textContent = 'Unfollow';
            followButton.setAttribute('data-tab-id', '' + tab.openState.id);
            followButton.addEventListener('mouseup', (event) => {
                this.commandBus.handle(new UnfollowTab(tab));
            });

            followCell.appendChild(followButton);
        }

        return followCell;
    }

    onTabOpen(event: TabOpened): Promise<void> {
        this.refresh();

        return;
    }

    onTabClose(event: TabClosed): Promise<void> {
        this.refresh();

        return;
    }

    onOpenTabMove(event: OpenTabMoved): Promise<void> {
        this.refresh();

        return;
    }

    onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated): Promise<void> {
        this.refresh();

        return;
    }

    onOpenTabTitleUpdate(event: OpenTabTitleUpdated): Promise<void> {
        this.refresh();

        return;
    }

    onOpenTabUrlUpdate(event: OpenTabUrlUpdated): Promise<void> {
        this.refresh();

        return;
    }

    onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated): Promise<void> {
        this.refresh();

        return;
    }

    onTabFollow(event: TabFollowed): Promise<void> {
        this.refresh();

        return;
    }

    onTabUnfollow(event: TabUnfollowed): Promise<void> {
        this.refresh();

        return;
    }

    onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab): Promise<void> {
        this.refresh();

        return;
    }
}
