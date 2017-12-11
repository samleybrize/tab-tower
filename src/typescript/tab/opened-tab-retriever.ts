import { FollowedTabRetriever } from './followed-tab-retriever';
import { Tab } from './tab';

export class OpenedTabRetriever {
    constructor(private followedTabRetriever: FollowedTabRetriever, private ignoredUrls: string[]) {
    }

    async getAll(): Promise<Tab[]> {
        const openedFollowedTabs = await this.followedTabRetriever.getOpenedTabs();
        const rawTabs = await browser.tabs.query({});
        const tabList: Tab[] = [];

        for (const rawTab of rawTabs) {
            console.log(rawTab); // TODO
            const tab = this.createTab(rawTab, openedFollowedTabs);

            if (null == tab) {
                continue;
            }

            tabList.push(tab);
        }

        return tabList;
    }

    private createTab(rawTab: browser.tabs.Tab, openedFollowedTabs: Map<number, Tab>): Tab {
        if (this.isUrlIgnored(rawTab.url) || null == rawTab.id || null == rawTab.index) {
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

    async getById(id: number): Promise<Tab> {
        let rawTab: browser.tabs.Tab;

        try {
            rawTab = await browser.tabs.get(id);
        } catch (error) {
            return null;
        }

        const openedFollowedTabs = await this.followedTabRetriever.getOpenedTabs();

        return this.createTab(rawTab, openedFollowedTabs);
    }
}
