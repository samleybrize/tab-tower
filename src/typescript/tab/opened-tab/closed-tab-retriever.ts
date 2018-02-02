import { QueryBus } from '../../bus/query-bus';
import { OpenedTabFaviconUrlUpdated } from '../event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../event/opened-tab-focused';
import { OpenedTabMoved } from '../event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from '../event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../event/opened-tab-url-updated';
import { TabCloseHandled } from '../event/tab-close-handled';
import { TabOpened } from '../event/tab-opened';
import { TabOpenState } from './tab-open-state';

export class ClosedTabRetriever {
    private openedTabMap = new Map<number, TabOpenState>();

    constructor(private queryBus: QueryBus) {
    }

    async init() {
        if (this.openedTabMap.size > 0) {
            return;
        }

        const tabList = await this.openedTabRetriever.getAll(); // TODO query

        for (const tab of tabList) {
            this.openedTabMap.set(tab.id, tab);
        }
    }

    async onTabOpen(event: TabOpened) {
        this.openedTabMap.set(event.tabOpenState.id, event.tabOpenState);
    }

    async onTabMove(event: OpenedTabMoved) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.index = event.tabOpenState.index;
        }
    }

    async onTabTitleUpdate(event: OpenedTabTitleUpdated) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.title = event.tabOpenState.title;
        }
    }

    async onTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.isInReaderMode = event.tabOpenState.isInReaderMode;
        }
    }

    async onTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.url = event.tabOpenState.url;
        }
    }

    async onTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.faviconUrl = event.tabOpenState.faviconUrl;
        }
    }

    async onTabFocus(event: OpenedTabFocused) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.lastAccess = event.tabOpenState.lastAccess;
        }
    }

    async onTabCloseHandled(event: TabCloseHandled) {
        this.openedTabMap.delete(event.closedTab.id);
    }

    async getById(id: number): Promise<TabOpenState> {
        return this.openedTabMap.get(id) || null;
    }
}
