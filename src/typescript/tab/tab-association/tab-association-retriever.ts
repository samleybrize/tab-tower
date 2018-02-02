import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { OpenedTabAssociatedToFollowedTab } from '../event/opened-tab-associated-to-followed-tab';
import { GetFollowIdAssociatedToOpenId } from '../query/get-follow-id-associated-to-open-id';
import { GetOpenIdAssociatedToFollowId } from '../query/get-open-id-associated-to-follow-id';
import { GetTabAssociationByFollowId } from '../query/get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from '../query/get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from '../query/get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from '../query/get-tab-associations-with-open-state';
import { GetTabFollowStateByFollowId } from '../query/get-tab-follow-state-by-follow-id';
import { GetTabFollowStates } from '../query/get-tab-follow-states';
import { GetTabOpenStateByOpenId } from '../query/get-tab-open-state-by-open-id';
import { GetTabOpenStates } from '../query/get-tab-open-states';
import { TabAssociation } from './tab-association';

export class TabAssociationRetriever {
    constructor(private queryBus: QueryBus) {
    }

    async queryOpenedTabs(query: GetTabAssociationsWithOpenState): Promise<TabAssociation[]> {
        const tabOpenStateList = await this.queryBus.query(new GetTabOpenStates());
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
        const associatedFollowId = await this.queryBus.query(new GetFollowIdAssociatedToOpenId(openTabId));

        if (associatedFollowId) {
            return await this.queryBus.query(new GetTabFollowStateByFollowId(associatedFollowId));
        }

        return null;
    }

    async queryFollowedTabs(query: GetTabAssociationsWithFollowState): Promise<TabAssociation[]> {
        const tabFollowStateList = await this.queryBus.query(new GetTabFollowStates());
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
        const associatedOpenTabId = await this.queryBus.query(new GetOpenIdAssociatedToFollowId(followId));

        if (associatedOpenTabId) {
            return await this.queryBus.query(new GetTabOpenStateByOpenId(associatedOpenTabId));
        }

        return null;
    }

    async queryByOpenId(query: GetTabAssociationByOpenId): Promise<TabAssociation> {
        const tabOpenState = await this.queryBus.query(new GetTabOpenStateByOpenId(query.openId));

        if (null == tabOpenState) {
            return null;
        }

        const tab = new TabAssociation();
        tab.openState = tabOpenState;
        tab.followState = await this.getAssociatedTabFollowedState(query.openId);

        return tab;
    }

    async queryByFollowId(query: GetTabAssociationByFollowId): Promise<TabAssociation> {
        const tabFollowState = await this.queryBus.query(new GetTabFollowStateByFollowId(query.followId));

        if (null == tabFollowState) {
            return null;
        }

        const tab = new TabAssociation();
        tab.followState = tabFollowState;
        tab.openState = await this.getAssociatedTabOpenState(query.followId);

        return tab;
    }
}
