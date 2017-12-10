import { FollowedTabRetriever } from './followed-tab-retriever';
import { Tab } from './tab';

export class OpenedTabRetriever {
    constructor(private followedTabRetriever: FollowedTabRetriever) {
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
        if (0 == rawTab.url.indexOf('about:') || 0 == rawTab.url.indexOf('moz-extension:') || null == rawTab.id || null == rawTab.index) {
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

    async getById(id: number): Promise<Tab> {
        const rawTab = await browser.tabs.get(id);

        if (null == rawTab) {
            return;
        }

        const openedFollowedTabs = await this.followedTabRetriever.getOpenedTabs();

        return this.createTab(rawTab, openedFollowedTabs);
    }
}
