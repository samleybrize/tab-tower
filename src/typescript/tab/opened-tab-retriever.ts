import { TabOpenState } from './tab-open-state';

export class OpenedTabRetriever {
    constructor(private ignoreUrlsThatStartWith: string[]) {
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
        // incognito tabs are ignored for now
        if (this.isUrlIgnored(rawTab.url) || null === rawTab.id || null === rawTab.index || rawTab.incognito) {
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
        tab.isPrivileged = this.isTabPrivileged(url, isInReaderMode);

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

    private isTabPrivileged(tabUrl: string, isInReaderMode: boolean): boolean {
        if (isInReaderMode) {
            return false;
        }

        const colonIndex = tabUrl.indexOf(':');
        const predicate = tabUrl.substr(0, colonIndex);
        const forbiddenPredicates = ['about', 'chrome', 'data', 'file', 'javascript'];

        return forbiddenPredicates.indexOf(predicate) >= 0;
    }

    async getById(id: number): Promise<TabOpenState> {
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
}
