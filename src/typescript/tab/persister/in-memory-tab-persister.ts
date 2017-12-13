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

    async persist(tabFollowState: TabFollowState): Promise<void> {
        // TODO update if already in memory, else add
        this.tabList.push(tabFollowState);
    }

    async remove(tabFollowStateToRemove: TabFollowState): Promise<void> {
        // TODO optimize
        for (const arrayIndex of this.tabList.keys()) {
            if (this.tabList[arrayIndex] && this.tabList[arrayIndex].id == tabFollowStateToRemove.id) {
                this.tabList.splice(arrayIndex, 1);

                return;
            }
        }
    }
}
