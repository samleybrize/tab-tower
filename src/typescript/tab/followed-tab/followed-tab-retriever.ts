import { GetTabFollowStateByFollowId } from '../query/get-tab-follow-state-by-follow-id';
import { GetTabFollowStateWeightList } from '../query/get-tab-follow-state-weight-list';
import { GetTabFollowStates } from '../query/get-tab-follow-states';
import { GetTabFollowStatesWithOpenLongLivedId } from '../query/get-tab-follow-states-with-open-long-lived-id';
import { FollowStatePersister } from './persister/follow-state-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabRetriever {
    constructor(private tabPersister: FollowStatePersister) {
    }

    async queryAll(query: GetTabFollowStates) {
        return this.getAll();
    }

    private async getAll(): Promise<TabFollowState[]> {
        return this.tabPersister.getAll();
    }

    async queryAllWithOpenLongLivedId(query: GetTabFollowStatesWithOpenLongLivedId): Promise<Map<string, TabFollowState>> {
        const followStateList = await this.getAll();
        const map = new Map<string, TabFollowState>();

        for (const followState of followStateList) {
            if (null !== followState.openLongLivedId) {
                map.set(followState.openLongLivedId, followState);
            }
        }

        return map;
    }

    async queryById(query: GetTabFollowStateByFollowId): Promise<TabFollowState> {
        return this.tabPersister.getByFollowId(query.followId);
    }

    async queryWeightList(query: GetTabFollowStateWeightList): Promise<number[]> {
        return this.tabPersister.getWeightList();
    }
}
