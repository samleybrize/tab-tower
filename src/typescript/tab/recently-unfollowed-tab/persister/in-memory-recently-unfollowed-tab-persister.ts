import { TabFollowState } from '../../followed-tab/tab-follow-state';
import { RecentlyUnfollowedTab } from '../recently-unfollowed-tab';
import { RecentlyUnfollowedTabPersister } from './recently-unfollowed-tab-persister';

export class InMemoryRecentlyUnfollowedTabPersister implements RecentlyUnfollowedTabPersister {
    private recentlyUnfollowedTabMap = new Map<string, RecentlyUnfollowedTab>();
    private isRetrievedFromDecorated = false;

    constructor(private decoratedPersister?: RecentlyUnfollowedTabPersister) {
    }

    async getByFollowId(followId: string): Promise<RecentlyUnfollowedTab> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        return this.getClonedRecentlyUnfollowedTab(this.recentlyUnfollowedTabMap.get(followId));
    }

    private getClonedRecentlyUnfollowedTab(recentlyUnfollowedTab: RecentlyUnfollowedTab) {
        if (null == recentlyUnfollowedTab) {
            return null;
        }

        const followState = TabFollowState.fromObject(recentlyUnfollowedTab.followState);
        const clonedFollowState = new RecentlyUnfollowedTab(followState, new Date(recentlyUnfollowedTab.unfollowedAt));

        return clonedFollowState;
    }

    private async retrieveFromDecorated() {
        if (this.isRetrievedFromDecorated) {
            return;
        }

        const recentlyUnfollowedTabList = await this.decoratedPersister.getAll();

        for (const recentlyUnfollowedTab of recentlyUnfollowedTabList) {
            this.recentlyUnfollowedTabMap.set(recentlyUnfollowedTab.followState.id, recentlyUnfollowedTab);
        }

        this.isRetrievedFromDecorated = true;
    }

    async getAll(): Promise<RecentlyUnfollowedTab[]> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        return Array.from(this.recentlyUnfollowedTabMap.values());
    }

    async add(recentlyUnfollowedTab: RecentlyUnfollowedTab): Promise<void> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const followId = recentlyUnfollowedTab.followState.id;
        const clonedRecentlyUnfollowedTab = this.getClonedRecentlyUnfollowedTab(recentlyUnfollowedTab);
        this.recentlyUnfollowedTabMap.set(followId, clonedRecentlyUnfollowedTab);

        if (this.decoratedPersister) {
            this.decoratedPersister.add(recentlyUnfollowedTab);
        }
    }

    async remove(followId: string): Promise<void> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const recentlyUnfollowedTabToRemove = this.recentlyUnfollowedTabMap.get(followId);

        if (null == recentlyUnfollowedTabToRemove) {
            return;
        }

        this.recentlyUnfollowedTabMap.delete(followId);

        if (this.decoratedPersister) {
            this.decoratedPersister.remove(followId);
        }
    }
}
