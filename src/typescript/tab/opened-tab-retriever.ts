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
    private longLivedIdMap = new Map<string, number>();

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
        this.longLivedIdMap.set(event.tabOpenState.longLivedId, event.tabOpenState.id);
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
        this.longLivedIdMap.delete(event.closedTab.longLivedId);
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
        const tabOpenState = new TabOpenState();
        tabOpenState.id = rawTab.id;
        tabOpenState.longLivedId = await this.getTabLongLivedId(rawTab.id, false);
        tabOpenState.index = rawTab.index;
        tabOpenState.title = rawTab.title;
        tabOpenState.isIncognito = rawTab.incognito;
        tabOpenState.isInReaderMode = isInReaderMode;
        tabOpenState.url = url;
        tabOpenState.faviconUrl = rawTab.favIconUrl;
        tabOpenState.isPrivileged = this.privilegedUrlDetector.isPrivileged(url, isInReaderMode);
        tabOpenState.isIgnored = this.isUrlIgnored(rawTab.url);

        await this.assignNewLongLivedIdIfTabIsDuplicate(tabOpenState);

        return tabOpenState;
    }

    private async assignNewLongLivedIdIfTabIsDuplicate(tabOpenState: TabOpenState) {
        const tabIdCorrespondingToLongLivedId = this.longLivedIdMap.get(tabOpenState.longLivedId);

        if (tabIdCorrespondingToLongLivedId && tabOpenState.id != tabIdCorrespondingToLongLivedId) {
            tabOpenState.longLivedId = await this.getTabLongLivedId(tabOpenState.id, true);
        }
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

    private async getTabLongLivedId(tabId: number, alwaysRegenerate: boolean): Promise<string> {
        let longLivedId = await browser.sessions.getTabValue(tabId, 'longLivedId');

        if (alwaysRegenerate || 'string' != typeof longLivedId) {
            longLivedId = uuid.v1();
            await browser.sessions.setTabValue(tabId, 'longLivedId', longLivedId);
        }

        return longLivedId;
    }

    async getStillOpenedById(id: number, checkIfIsDuplicate?: boolean): Promise<TabOpenState> {
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
