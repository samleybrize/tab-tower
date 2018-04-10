import { QueryBus } from '../../bus/query-bus';
import { GetTabFollowStateByFollowId } from '../followed-tab/query/get-tab-follow-state-by-follow-id';
import { GetTabFollowStates } from '../followed-tab/query/get-tab-follow-states';
import { GetTabOpenStateByOpenId } from '../opened-tab/query/get-tab-open-state-by-open-id';
import { GetTabOpenStates } from '../opened-tab/query/get-tab-open-states';
import { GetFollowIdAssociatedToOpenId } from '../tab-association/query/get-follow-id-associated-to-open-id';
import { GetOpenIdAssociatedToFollowId } from '../tab-association/query/get-open-id-associated-to-follow-id';
import { GetTabAssociationByFollowId } from '../tab-association/query/get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from '../tab-association/query/get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from '../tab-association/query/get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from '../tab-association/query/get-tab-associations-with-open-state';
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
