import { EventBus } from '../../bus/event-bus';
import { OpenedTabAssociatedToFollowedTab } from '../event/opened-tab-associated-to-followed-tab';
import { FollowedTabRetriever } from '../followed-tab/followed-tab-retriever';
import { OpenedTabRetriever } from '../opened-tab/opened-tab-retriever';
import { GetFollowedTabs } from '../query/get-followed-tabs';
import { GetOpenedTabs } from '../query/get-opened-tabs';
import { GetTabByFollowId } from '../query/get-tab-by-follow-id';
import { GetTabByOpenId } from '../query/get-tab-by-open-id';
import { TabAssociation } from './tab-association';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class TabAssociationRetriever {
    constructor(
        private followedTabRetriever: FollowedTabRetriever,
        private openedTabRetriever: OpenedTabRetriever,
        private tabAssociationMaintainer: TabAssociationMaintainer,
    ) {
    }

    async queryOpenedTabs(query: GetOpenedTabs): Promise<TabAssociation[]> {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const tabList: TabAssociation[] = [];

        for (const tabOpenState of tabOpenStateList) {
            const tab = new TabAssociation();
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

    async queryFollowedTabs(query: GetFollowedTabs): Promise<TabAssociation[]> {
        const tabFollowStateList = await this.followedTabRetriever.getAll();
        const tabList: TabAssociation[] = [];

        for (const tabFollowState of tabFollowStateList) {
            const tab = new TabAssociation();
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

    async queryByOpenId(query: GetTabByOpenId): Promise<TabAssociation> {
        const tabOpenState = await this.openedTabRetriever.getById(query.openId);

        if (null == tabOpenState) {
            return null;
        }

        const tab = new TabAssociation();
        tab.openState = tabOpenState;
        tab.followState = await this.getAssociatedTabFollowedState(query.openId);

        return tab;
    }

    async queryByFollowId(query: GetTabByFollowId): Promise<TabAssociation> {
        const tabFollowState = await this.followedTabRetriever.getById(query.followId);

        if (null == tabFollowState) {
            return null;
        }

        const tab = new TabAssociation();
        tab.followState = tabFollowState;
        tab.openState = await this.getAssociatedTabOpenState(query.followId);

        return tab;
    }
}
