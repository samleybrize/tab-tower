import { GetTabFollowStateByFollowId } from '../query/get-tab-follow-state-by-follow-id';
import { GetTabFollowStates } from '../query/get-tab-follow-states';
import { GetTabFollowStatesWithOpenLongLivedId } from '../query/get-tab-follow-states-with-open-long-lived-id';
import { TabPersister } from './persister/tab-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabRetriever {
    constructor(private tabPersister: TabPersister) {
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
}