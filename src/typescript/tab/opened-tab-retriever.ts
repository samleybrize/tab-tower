import * as uuid from 'uuid';

import { PrivilegedUrlDetector } from './privileged-url-detector';
import { TabOpenState } from './tab-open-state';

export class OpenedTabRetriever {
    constructor(private privilegedUrlDetector: PrivilegedUrlDetector, private ignoreUrlsThatStartWith: string[]) {
    }

    async getAll(): Promise<TabOpenState[]> {
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
        if (this.isUrlIgnored(rawTab.url) || null === rawTab.id || null === rawTab.index || rawTab.incognito) {
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

    async getById(id: number): Promise<TabOpenState> {
        let rawTab: browser.tabs.Tab;

        try {
            // a not found id throws an error
            rawTab = await browser.tabs.get(id);
        } catch (error) {
            return null;
        }

        return await this.createTab(rawTab);
    }

    async getByIndex(index: number): Promise<TabOpenState> {
        const rawTabList = await browser.tabs.query({index});

        for (const rawTab of rawTabList) {
            if (rawTab.index == index) {
                return await this.createTab(rawTab);
            }
        }

        return null;
    }
}
