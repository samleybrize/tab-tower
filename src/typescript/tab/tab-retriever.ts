import { EventBus } from '../bus/event-bus';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { GetFollowedTabs } from './query/get-followed-tabs';
import { GetOpenedTabs } from './query/get-opened-tabs';
import { GetTabByFollowId } from './query/get-tab-by-follow-id';
import { GetTabByOpenId } from './query/get-tab-by-open-id';
import { Tab } from './tab';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class TabRetriever {
    constructor(
        private followedTabRetriever: FollowedTabRetriever,
        private openedTabRetriever: OpenedTabRetriever,
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private eventBus: EventBus,
    ) {
    }

    async associateOpenedTabsWithFollowedTabs() {
        const tabOpenStateList = await this.openedTabRetriever.getAllStillOpened();
        const candidateFollowStates = await this.followedTabRetriever.getWithOpenLongLivedId();

        for (const tabOpenState of tabOpenStateList) {
            const followState = candidateFollowStates.get(tabOpenState.longLivedId);

            if (followState) {
                this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(tabOpenState.id, followState.id);
                this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(tabOpenState, followState));
            }
        }
    }

    async queryOpenedTabs(query: GetOpenedTabs): Promise<Tab[]> {
        const tabOpenStateList = await this.openedTabRetriever.getAllStillOpened();
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

    async queryFollowedTabs(query: GetFollowedTabs): Promise<Tab[]> {
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
            return await this.openedTabRetriever.getStillOpenedById(associatedOpenTabId);
        }

        return null;
    }

    async queryByOpenId(query: GetTabByOpenId): Promise<Tab> {
        const tabOpenState = await this.openedTabRetriever.getStillOpenedById(query.openId);

        if (null == tabOpenState) {
            return null;
        }

        const tab = new Tab();
        tab.openState = tabOpenState;
        tab.followState = await this.getAssociatedTabFollowedState(query.openId);

        return tab;
    }

    async queryByFollowId(query: GetTabByFollowId): Promise<Tab> {
        const tabFollowState = await this.followedTabRetriever.getById(query.followId);

        if (null == tabFollowState) {
            return null;
        }

        const tab = new Tab();
        tab.followState = tabFollowState;
        tab.openState = await this.getAssociatedTabOpenState(query.followId);

        return tab;
    }
}
