import { TabClosing } from './event/tab-closing';
import { FollowedTabRetriever } from './followed-tab-retriever';
import { Tab } from './tab';

export class OpenedTabRetriever {
    private ignoredTabIdList: number[] = [];
    private ignoredTabIdListPurgeTimeoutReference: number = null;

    constructor(private followedTabRetriever: FollowedTabRetriever, private ignoredUrls: string[]) {
    }

    async getAll(): Promise<Tab[]> {
        const openedFollowedTabs = await this.followedTabRetriever.getOpenedTabs();
        const rawTabs = await browser.tabs.query({});
        const tabList: Tab[] = [];

        for (const rawTab of rawTabs) {
            const tab = this.createTab(rawTab, openedFollowedTabs);

            if (null == tab) {
                continue;
            }

            tabList.push(tab);
        }

        return tabList;
    }

    private createTab(rawTab: browser.tabs.Tab, openedFollowedTabs: Map<number, Tab>): Tab {
        if (this.isUrlIgnored(rawTab.url) || this.isTabIdIgnored(rawTab.id) || null == rawTab.id || null == rawTab.index) {
            return;
        }

        const tab = new Tab();
        tab.id = rawTab.id;
        tab.index = rawTab.index;
        tab.title = rawTab.title;
        tab.isIncognito = rawTab.incognito;
        tab.url = rawTab.url;
        tab.faviconUrl = rawTab.favIconUrl;
        tab.isFollowed = openedFollowedTabs.has(rawTab.id);

        return tab;
    }

    private isUrlIgnored(url: string) {
        return 0 == url.indexOf('about:') || this.ignoredUrls.indexOf(url) >= 0;
    }

    private isTabIdIgnored(tabId: number) {
        return this.ignoredTabIdList.indexOf(tabId) >= 0;
    }

    async getById(id: number): Promise<Tab> {
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

        const openedFollowedTabs = await this.followedTabRetriever.getOpenedTabs();

        return this.createTab(rawTab, openedFollowedTabs);
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
