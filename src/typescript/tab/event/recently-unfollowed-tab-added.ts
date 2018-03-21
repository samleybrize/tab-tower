import { RecentlyUnfollowedTab } from '../recently-unfollowed-tab/recently-unfollowed-tab';

export class RecentlyUnfollowedTabAdded {
    constructor(public readonly recentlyUnfollowedTab: RecentlyUnfollowedTab) {
    }
}
