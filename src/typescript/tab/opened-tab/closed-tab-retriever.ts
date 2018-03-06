import { QueryBus } from '../../bus/query-bus';
import { sleep } from '../../utils/sleep';
import { OpenedTabFaviconUrlUpdated } from '../event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../event/opened-tab-focused';
import { OpenedTabMoved } from '../event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../event/opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from '../event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../event/opened-tab-url-updated';
import { TabCloseHandled } from '../event/tab-close-handled';
import { TabOpened } from '../event/tab-opened';
import { GetClosedTabOpenStateByOpenId } from '../query/get-closed-tab-open-state-by-open-id';
import { GetTabOpenStates } from '../query/get-tab-open-states';
import { TabOpenState } from './tab-open-state';

export class ClosedTabRetriever {
    private openedTabMap = new Map<number, TabOpenState>();

    constructor(private queryBus: QueryBus) {
    }

    async init() {
        // needed, otherwise session tabs might not be found at browser start
        await sleep(200);

        this.openedTabMap.clear();
        const tabList = await this.queryBus.query(new GetTabOpenStates());

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

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        const existingTab = this.openedTabMap.get(event.tabOpenState.id);

        if (existingTab) {
            existingTab.isPinned = event.tabOpenState.isPinned;
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

    async queryById(query: GetClosedTabOpenStateByOpenId): Promise<TabOpenState> {
        return this.openedTabMap.get(query.openId) || null;
    }
}
