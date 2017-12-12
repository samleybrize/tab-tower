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
                return followedTab;
            }
        }

        return null;
    }

    async add(tab: TabFollowState): Promise<void> {
        // TODO do not add if already in memory
        this.tabList.push(tab);
    }
}
