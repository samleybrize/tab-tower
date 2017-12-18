import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { Tab } from './tab';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class TabRetriever {
    constructor(
        private followedTabRetriever: FollowedTabRetriever,
        private openedTabRetriever: OpenedTabRetriever,
        private tabAssociationMaintainer: TabAssociationMaintainer,
    ) {
    }

    async associateOpenedTabsWithFollowedTabs() {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const candidateFollowStates = await this.followedTabRetriever.getWithOpenIndex();

        for (const tabOpenState of tabOpenStateList) {
            const followState = candidateFollowStates.get(tabOpenState.index);

            if (followState && tabOpenState.url == followState.url) {
                this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(tabOpenState.id, followState.id);
                // TODO publish OpenedTabAssociatedToFollowedTab
            }
        }
    }

    async getOpenedTabs(): Promise<Tab[]> {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const tabList: Tab[] = [];

        for (const tabOpenState of tabOpenStateList) {
            const tab = new Tab();
            tab.openState = tabOpenState;
            tab.followState = await this.getAssociatedTabFollowedState(tabOpenState.id);
            tabList.push(tab);
        }

        return tabList;
    }

    private async getAssociatedTabFollowedState(openTabId: number) {
        const associatedFollowId = this.tabAssociationMaintainer.getAssociatedFollowId(openTabId);

        if (associatedFollowId) {
            return await this.followedTabRetriever.getById(associatedFollowId);
        }

        return null;
    }

    async getFollowedTabs(): Promise<Tab[]> {
        const tabFollowStateList = await this.followedTabRetriever.getAll();
        const tabList: Tab[] = [];

        for (const tabFollowState of tabFollowStateList) {
            const tab = new Tab();
            tab.followState = tabFollowState;
            tab.openState = await this.getAssociatedTabOpenState(tabFollowState.id);
            tabList.push(tab);
        }

        return tabList;
    }

    private async getAssociatedTabOpenState(followId: string) {
        const associatedOpenTabId = this.tabAssociationMaintainer.getAssociatedOpenedTabId(followId);

        if (associatedOpenTabId) {
            return await this.openedTabRetriever.getById(associatedOpenTabId);
        }

        return null;
    }

    async getByOpenId(tabOpenId: number): Promise<Tab> {
        const tabOpenState = await this.openedTabRetriever.getById(tabOpenId);

        if (null == tabOpenState) {
            return null;
        }

        const tab = new Tab();
        tab.openState = tabOpenState;
        tab.followState = await this.getAssociatedTabFollowedState(tabOpenId);

        return tab;
    }

    async getByFollowId(tabFollowId: string): Promise<Tab> {
        const tabFollowState = await this.followedTabRetriever.getById(tabFollowId);

        if (null == tabFollowState) {
            return null;
        }

        const tab = new Tab();
        tab.followState = tabFollowState;
        tab.openState = await this.getAssociatedTabOpenState(tabFollowId);

        return tab;
    }
}
