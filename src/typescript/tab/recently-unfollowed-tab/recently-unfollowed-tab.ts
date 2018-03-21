import { TabFollowState } from '../followed-tab/tab-follow-state';

export class RecentlyUnfollowedTab {
    constructor(public readonly followState: TabFollowState, public readonly unfollowedAt: Date) {
    }

    static fromObject(sourceObject: any): RecentlyUnfollowedTab {
        const followState = TabFollowState.fromObject(sourceObject.followState);
        const recentlyUnfollowedTab = new RecentlyUnfollowedTab(followState, sourceObject.unfollowedAt);

        return recentlyUnfollowedTab;
    }
}
