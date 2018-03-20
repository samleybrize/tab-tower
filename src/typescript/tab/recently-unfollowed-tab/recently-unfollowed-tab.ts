import { TabFollowState } from '../followed-tab/tab-follow-state';

export class RecentlyUnfollowedTab {
    constructor(public readonly followState: TabFollowState, public readonly unfollowedAt: Date) {
    }

    static fromObject(sourceObject: any): RecentlyUnfollowedTab {
        const recentlyUnfollowedTab = new RecentlyUnfollowedTab(sourceObject.followState, sourceObject.unfollowedAt);

        return recentlyUnfollowedTab;
    }
}
