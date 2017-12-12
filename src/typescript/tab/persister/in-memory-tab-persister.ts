import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

export class InMemoryTabPersister implements TabPersister {
    private tabList: TabFollowState[] = [];

    async getAll(): Promise<TabFollowState[]> {
        return this.tabList;
    }

    async getByIndex(index: number): Promise<TabFollowState> {
        // TODO optimize
        for (const followedTab of this.tabList) {
            if (followedTab.openIndex == index) {
                // TODO return a copy
                return followedTab;
            }
        }

        return null;
    }

    async persist(tab: TabFollowState): Promise<void> {
        // TODO update if already in memory, else add
        this.tabList.push(tab);
    }
}
