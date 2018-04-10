import { RecentlyUnfollowedTabPersister } from './persister/recently-unfollowed-tab-persister';
import { GetRecentlyUnfollowedTabs } from './query/get-recently-unfollowed-tabs';
import { GetRecentlyUnfollowedTabByFollowId } from './query/get-recently-unfollowed-tabs-by-follow-id';

export class RecentlyUnfollowedTabRetriever {
    constructor(private persister: RecentlyUnfollowedTabPersister) {
    }

    async queryByFollowId(query: GetRecentlyUnfollowedTabByFollowId) {
        return this.persister.getByFollowId(query.followId);
    }

    async queryAll(query: GetRecentlyUnfollowedTabs) {
        return this.persister.getAll();
    }
}
