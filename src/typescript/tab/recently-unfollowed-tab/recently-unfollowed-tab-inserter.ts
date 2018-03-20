import { TabUnfollowed } from '../event/tab-unfollowed';
import { RecentlyUnfollowedTabPersister } from './persister/recently-unfollowed-tab-persister';
import { RecentlyUnfollowedTab } from './recently-unfollowed-tab';

export class RecentlyUnfollowedTabInserter {
    constructor(private persister: RecentlyUnfollowedTabPersister) {
    }

    async onTabUnfollow(event: TabUnfollowed) {
        const recentlyUnfollowedTab = new RecentlyUnfollowedTab(event.oldFollowState, new Date());
        await this.persister.add(recentlyUnfollowedTab);
    }
}
