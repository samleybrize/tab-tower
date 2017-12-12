import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { Tab } from './tab';

export class TabRetriever {
    constructor(private followedTabRetriever: FollowedTabRetriever, private openedTabRetriever: OpenedTabRetriever) {
    }

    async getOpenedTabs(): Promise<Tab[]> {
        const openedTabList = await this.openedTabRetriever.getAll();
        const followedTabList = await this.followedTabRetriever.getAll();
        const tabList: Tab[] = [];

        for (const openedTab of openedTabList) {
            const tab = new Tab();
            tab.openState = openedTab;
            tab.followState = await this.followedTabRetriever.getByIndex(openedTab.index);
            tabList.push(tab);
        }

        return tabList;
    }

    async getFollowedTabs(): Promise<Tab[]> {
        const openedTabList = await this.openedTabRetriever.getAll();
        const followedTabList = await this.followedTabRetriever.getAll();
        const tabList: Tab[] = [];

        for (const followedTab of followedTabList) {
            const tab = new Tab();
            tab.followState = followedTab;
            tabList.push(tab);

            if (followedTab.openIndex) {
                tab.openState = await this.openedTabRetriever.getByIndex(followedTab.openIndex);
            }
        }

        return tabList;
    }
}
