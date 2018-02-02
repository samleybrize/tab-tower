import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { OpenedTabAssociatedToFollowedTab } from '../event/opened-tab-associated-to-followed-tab';
import { GetTabAssociationByFollowId } from '../query/get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from '../query/get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from '../query/get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from '../query/get-tab-associations-with-open-state';
import { TabAssociation } from './tab-association';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class TabAssociationRetriever {
    constructor(
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private queryBus: QueryBus,
    ) {
    }

    async queryOpenedTabs(query: GetTabAssociationsWithOpenState): Promise<TabAssociation[]> {
        const tabOpenStateList = await this.openedTabRetriever.getAll(); // TODO query
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
            return await this.followedTabRetriever.getById(associatedFollowId); // TODO query
        }

        return null;
    }

    async queryFollowedTabs(query: GetTabAssociationsWithFollowState): Promise<TabAssociation[]> {
        const tabFollowStateList = await this.followedTabRetriever.getAll(); // TODO query
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
            return await this.openedTabRetriever.getById(associatedOpenTabId); // TODO query
        }

        return null;
    }

    async queryByOpenId(query: GetTabAssociationByOpenId): Promise<TabAssociation> {
        const tabOpenState = await this.openedTabRetriever.getById(query.openId); // TODO query

        if (null == tabOpenState) {
            return null;
        }

        const tab = new TabAssociation();
        tab.openState = tabOpenState;
        tab.followState = await this.getAssociatedTabFollowedState(query.openId);

        return tab;
    }

    async queryByFollowId(query: GetTabAssociationByFollowId): Promise<TabAssociation> {
        const tabFollowState = await this.followedTabRetriever.getById(query.followId); // TODO query

        if (null == tabFollowState) {
            return null;
        }

        const tab = new TabAssociation();
        tab.followState = tabFollowState;
        tab.openState = await this.getAssociatedTabOpenState(query.followId);

        return tab;
    }
}
