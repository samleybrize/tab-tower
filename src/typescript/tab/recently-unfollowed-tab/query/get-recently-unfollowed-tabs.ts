import { Query } from '../../../bus/query-bus';
import { RecentlyUnfollowedTab } from '../recently-unfollowed-tab';

export class GetRecentlyUnfollowedTabs implements Query<RecentlyUnfollowedTab[]> {
    readonly resultType: RecentlyUnfollowedTab[];
}
