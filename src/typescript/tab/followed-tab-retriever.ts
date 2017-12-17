import { TabPersister } from './persister/tab-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabRetriever {
    constructor(private tabPersister: TabPersister) {
    }

    async getAll(): Promise<TabFollowState[]> {
        return this.tabPersister.getAll();
    }

    async getWithOpenIndex(): Promise<Map<number, TabFollowState>> {
        const followStateList = await this.getAll();
        const map = new Map<number, TabFollowState>();

        for (const followState of followStateList) {
            if (null !== followState.openIndex) {
                map.set(followState.openIndex, followState);
            }
        }

        return map;
    }

    async getById(id: string): Promise<TabFollowState> {
        return this.tabPersister.getByFollowId(id);
    }
}
