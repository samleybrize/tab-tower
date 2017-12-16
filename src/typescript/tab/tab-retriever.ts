import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { Tab } from './tab';

export class TabRetriever {
    constructor(private followedTabRetriever: FollowedTabRetriever, private openedTabRetriever: OpenedTabRetriever) {
    }

    async getOpenedTabs(): Promise<Tab[]> {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const tabList: Tab[] = [];

        for (const tabOpenState of tabOpenStateList) {
            const tab = new Tab();
            tab.openState = tabOpenState;
            tab.followState = await this.followedTabRetriever.getByOpenIndex(tabOpenState.index);
            tabList.push(tab);
        }

        return tabList;
    }

    async getFollowedTabs(): Promise<Tab[]> {
        const tabFollowStateList = await this.followedTabRetriever.getAll();
        const tabList: Tab[] = [];

        for (const tabFollowState of tabFollowStateList) {
            const tab = new Tab();
            tab.followState = tabFollowState;
            tabList.push(tab);

            if (tabFollowState.openIndex) {
                tab.openState = await this.openedTabRetriever.getByIndex(tabFollowState.openIndex);
            }
        }

        return tabList;
    }

    async getByOpenId(tabOpenId: number): Promise<Tab> {
        const tabOpenState = await this.openedTabRetriever.getById(tabOpenId);

        if (null == tabOpenState) {
            return null;
        }

        const tab = new Tab();
        tab.openState = tabOpenState;
        tab.followState = await this.followedTabRetriever.getByOpenIndex(tabOpenState.index);

        return tab;
    }

    async getByFollowId(tabFollowId: string): Promise<Tab> {
        const tabFollowState = await this.followedTabRetriever.getById(tabFollowId);

        if (null == tabFollowState) {
            return null;
        }

        const tab = new Tab();
        tab.followState = tabFollowState;
        tab.openState = await this.openedTabRetriever.getByIndex(tabFollowState.openIndex);

        return tab;
    }
}
