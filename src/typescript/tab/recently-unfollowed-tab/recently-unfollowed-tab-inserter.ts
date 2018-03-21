import { EventBus } from '../../bus/event-bus';
import { RecentlyUnfollowedTabAdded } from '../event/recently-unfollowed-tab-added';
import { TabUnfollowed } from '../event/tab-unfollowed';
import { RecentlyUnfollowedTabPersister } from './persister/recently-unfollowed-tab-persister';
import { RecentlyUnfollowedTab } from './recently-unfollowed-tab';

export class RecentlyUnfollowedTabInserter {
    constructor(private eventBus: EventBus, private persister: RecentlyUnfollowedTabPersister) {
    }

    async onTabUnfollow(event: TabUnfollowed) {
        if (await this.isFollowIdAlreadyRegistered(event.oldFollowState.id)) {
            return;
        }

        const recentlyUnfollowedTab = new RecentlyUnfollowedTab(event.oldFollowState, new Date());
        await this.persister.add(recentlyUnfollowedTab);

        this.eventBus.publish(new RecentlyUnfollowedTabAdded(recentlyUnfollowedTab));
    }

    private async isFollowIdAlreadyRegistered(followId: string) {
        return null != await this.persister.getByFollowId(followId);
    }
}
