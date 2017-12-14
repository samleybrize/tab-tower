import { TabPersister } from './persister/tab-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabRetriever {
    constructor(private tabPersister: TabPersister) {
    }

    async getAll(): Promise<TabFollowState[]> {
        return this.tabPersister.getAll();
    }

    async getByOpenIndex(index: number): Promise<TabFollowState> {
        return this.tabPersister.getByOpenIndex(index);
    }

    async getById(id: string): Promise<TabFollowState> {
        return this.tabPersister.getByFollowId(id);
    }
}
