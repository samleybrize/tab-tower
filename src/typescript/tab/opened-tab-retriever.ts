import * as uuid from 'uuid';

import { OpenedTabFaviconUrlUpdated } from './event/opened-tab-favicon-url-updated';
import { OpenedTabMoved } from './event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './event/opened-tab-url-updated';
import { TabClosed } from './event/tab-closed';
import { TabOpened } from './event/tab-opened';
import { PrivilegedUrlDetector } from './privileged-url-detector';
import { TabOpenState } from './tab-open-state';

export class OpenedTabRetriever {
    private openedTabMap = new Map<number, TabOpenState>();

    constructor(private privilegedUrlDetector: PrivilegedUrlDetector, private ignoreUrlsThatStartWith: string[]) {
    }

    async init() {
        if (this.openedTabMap.size > 0) {
            return;
        }

        const tabList = await this.getAllStillOpened();

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

    async onTabClose(event: TabClosed) {
        this.openedTabMap.delete(event.closedTab.id);
    }

    async getAllStillOpened(): Promise<TabOpenState[]> {
        const rawTabs = await browser.tabs.query({});
        const tabList: TabOpenState[] = [];

        for (const rawTab of rawTabs) {
            const tab = await this.createTab(rawTab);

            if (null == tab) {
                continue;
            }

            tabList.push(tab);
        }

        return tabList;
    }

    private async createTab(rawTab: browser.tabs.Tab): Promise<TabOpenState> {
        // incognito tabs are ignored for now
        if (null === rawTab.id || null === rawTab.index || rawTab.incognito) {
            return;
        }

        const {url, isInReaderMode} = this.getUrlAndReaderModeState(rawTab);
        const tab = new TabOpenState();
        tab.id = rawTab.id;
        tab.longLivedId = await this.getTabLongLivedId(rawTab.id);
        tab.index = rawTab.index;
        tab.title = rawTab.title;
        tab.isIncognito = rawTab.incognito;
        tab.isInReaderMode = isInReaderMode;
        tab.url = url;
        tab.faviconUrl = rawTab.favIconUrl;
        tab.isPrivileged = this.privilegedUrlDetector.isPrivileged(url, isInReaderMode);
        tab.isIgnored = this.isUrlIgnored(rawTab.url);

        return tab;
    }

    private isUrlIgnored(url: string) {
        for (const startToIgnore of this.ignoreUrlsThatStartWith) {
            if (0 == url.indexOf(startToIgnore)) {
                return true;
            }
        }

        return false;
    }

    private getUrlAndReaderModeState(rawTab: browser.tabs.Tab) {
        let url = rawTab.url;
        let isInReaderMode = false;

        if (0 == url.indexOf('about:reader?')) {
            url = new URL(url).searchParams.get('url');
            url = decodeURI(url);
            isInReaderMode = true;
        }

        return {url, isInReaderMode};
    }

    private async getTabLongLivedId(tabId: number): Promise<string> {
        let longLivedId = await browser.sessions.getTabValue(tabId, 'longLivedId');

        if ('string' != typeof longLivedId) {
            longLivedId = uuid.v1();
            await browser.sessions.setTabValue(tabId, 'longLivedId', longLivedId);
        }

        return longLivedId;
    }

    async getStillOpenedById(id: number): Promise<TabOpenState> {
        let rawTab: browser.tabs.Tab;

        try {
            // a not found id throws an error
            rawTab = await browser.tabs.get(id);
        } catch (error) {
            return null;
        }

        return await this.createTab(rawTab);
    }

    async getById(id: number): Promise<TabOpenState> {
        return this.openedTabMap.get(id) || null;
    }
}
