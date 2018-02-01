import { TabPersister } from '../persister/tab-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabRetriever {
    constructor(private tabPersister: TabPersister) {
    }

    async getAll(): Promise<TabFollowState[]> {
        return this.tabPersister.getAll();
    }

    async getWithOpenLongLivedId(): Promise<Map<string, TabFollowState>> {
        const followStateList = await this.getAll();
        const map = new Map<string, TabFollowState>();

        for (const followState of followStateList) {
            if (null !== followState.openLongLivedId) {
                map.set(followState.openLongLivedId, followState);
            }
        }

        return map;
    }

    async getById(id: string): Promise<TabFollowState> {
        return this.tabPersister.getByFollowId(id);
    }
}
