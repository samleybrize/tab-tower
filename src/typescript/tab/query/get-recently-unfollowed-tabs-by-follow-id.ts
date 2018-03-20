import { Query } from '../../bus/query-bus';
import { RecentlyUnfollowedTab } from '../recently-unfollowed-tab/recently-unfollowed-tab';

export class GetRecentlyUnfollowedTabByFollowId implements Query<RecentlyUnfollowedTab> {
    readonly resultType: RecentlyUnfollowedTab;

    constructor(public readonly followId: string) {
    }
}
