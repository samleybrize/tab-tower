import { Tab } from './tab';

export class OpenedTabRetriever {
    async get(): Promise<Tab[]> {
        const rawTabs = await browser.tabs.query({});
        const tabList: Tab[] = [];

        for (const tab of rawTabs) {
            const tabUrl = tab.url;

            if (0 == tabUrl.indexOf('about:') || 0 == tabUrl.indexOf('moz-extension:')) {
                continue;
            }

            tabList.push({
                id: tab.id,
                index: tab.index,
                title: tab.title,
                isIncognito: tab.incognito,
                url: tab.url,
                faviconUrl: tab.favIconUrl,
                isOpened: true,
                isFollowed: false, // TODO
            });
        }

        return tabList;
    }
}
