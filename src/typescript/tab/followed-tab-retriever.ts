import { TabPersister } from './persister/tab-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabRetriever {
    constructor(private tabPersister: TabPersister) {
    }

    async getAll(): Promise<TabFollowState[]> {
        return this.tabPersister.getAll();
    }

    async getByIndex(index: number): Promise<TabFollowState> {
        return this.tabPersister.getByIndex(index);
    }
}
