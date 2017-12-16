import { TabClosing } from './event/tab-closing';
import { TabOpenState } from './tab-open-state';

export class OpenedTabRetriever {
    private ignoredTabIdList: number[] = [];
    private ignoredTabIdListPurgeTimeoutReference: number = null;

    constructor(private ignoredUrls: string[]) {
        this.ignoredUrls.push('about:blank');
    }

    async getAll(): Promise<TabOpenState[]> {
        const rawTabs = await browser.tabs.query({});
        const tabList: TabOpenState[] = [];

        for (const rawTab of rawTabs) {
            const tab = this.createTab(rawTab);

            if (null == tab) {
                continue;
            }

            tabList.push(tab);
        }

        return tabList;
    }

    private createTab(rawTab: browser.tabs.Tab): TabOpenState {
        if (this.isUrlIgnored(rawTab.url) || this.isTabIdIgnored(rawTab.id) || null === rawTab.id || null === rawTab.index) {
            return;
        }

        const {url, isInReaderMode} = this.getUrlAndReaderModeState(rawTab);
        const tab = new TabOpenState();
        tab.id = rawTab.id;
        tab.index = rawTab.index;
        tab.title = rawTab.title;
        tab.isIncognito = rawTab.incognito;
        tab.isInReaderMode = isInReaderMode;
        tab.url = url;
        tab.faviconUrl = rawTab.favIconUrl;

        return tab;
    }

    private isUrlIgnored(url: string) {
        return this.ignoredUrls.indexOf(url) >= 0;
    }

    private isTabIdIgnored(tabId: number) {
        return this.ignoredTabIdList.indexOf(tabId) >= 0;
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

    async getById(id: number): Promise<TabOpenState> {
        if (this.isTabIdIgnored(id)) {
            return null;
        }

        let rawTab: browser.tabs.Tab;

        try {
            // a not found id throws an error
            rawTab = await browser.tabs.get(id);
        } catch (error) {
            return null;
        }

        return this.createTab(rawTab);
    }

    async getByIndex(index: number): Promise<TabOpenState> {
        const rawTabList = await browser.tabs.query({index});

        for (const rawTab of rawTabList) {
            if (rawTab.index == index) {
                return this.createTab(rawTab);
            }
        }

        return null;
    }

    onTabClosing(event: TabClosing): Promise<void> {
        this.ignoredTabIdList.push(event.tabId);

        if (this.ignoredTabIdListPurgeTimeoutReference) {
            clearTimeout(this.ignoredTabIdListPurgeTimeoutReference);
            this.ignoredTabIdListPurgeTimeoutReference = null;
        }

        this.ignoredTabIdListPurgeTimeoutReference = setTimeout(this.purgeIgnoredTabIdList.bind(this), 60000);

        return;
    }

    private purgeIgnoredTabIdList() {
        this.ignoredTabIdList = [];
    }
}
