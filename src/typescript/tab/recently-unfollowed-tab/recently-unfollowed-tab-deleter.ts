import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { DeleteRecentlyUnfollowedTab } from '../command/delete-recently-unfollowed-tab';
import { RecentlyUnfollowedTabAdded } from '../event/recently-unfollowed-tab-added';
import { RecentlyUnfollowedTabDeleted } from '../event/recently-unfollowed-tab-deleted';
import { GetRecentlyUnfollowedTabs } from '../query/get-recently-unfollowed-tabs';
import { GetRecentlyUnfollowedTabByFollowId } from '../query/get-recently-unfollowed-tabs-by-follow-id';
import { RecentlyUnfollowedTabPersister } from './persister/recently-unfollowed-tab-persister';
import { RecentlyUnfollowedTab } from './recently-unfollowed-tab';

export class RecentlyUnfollowedTabDeleter {
    constructor(
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private persister: RecentlyUnfollowedTabPersister,
        private maximumNumberOfTabs: number,
    ) {
    }

    async delete(command: DeleteRecentlyUnfollowedTab) {
        const recentlyUnfollowedTab = await this.queryBus.query(new GetRecentlyUnfollowedTabByFollowId(command.followId));

        if (recentlyUnfollowedTab) {
            await this.deleteRecentlyUnfollowedTab(recentlyUnfollowedTab);
        }
    }

    private async deleteRecentlyUnfollowedTab(recentlyUnfollowedTab: RecentlyUnfollowedTab) {
        await this.persister.remove(recentlyUnfollowedTab.followState.id);

        this.eventBus.publish(new RecentlyUnfollowedTabDeleted(recentlyUnfollowedTab));
    }

    async onRecentlyUnfollowedTabAdd(event: RecentlyUnfollowedTabAdded) {
        await this.purgeRecentlyUnfollowedTabs();
    }

    private async purgeRecentlyUnfollowedTabs() {
        const recentlyUnfollowedTabList = await this.queryBus.query(new GetRecentlyUnfollowedTabs());
        this.sortTabListByUnfollowDateAsc(recentlyUnfollowedTabList);
        const numberOfTabsToDelete = Math.max(0, recentlyUnfollowedTabList.length - this.maximumNumberOfTabs);

        if (0 == numberOfTabsToDelete) {
            return;
        }

        const recentlyUnfollowedTabsToDelete = recentlyUnfollowedTabList.splice(0, numberOfTabsToDelete);

        for (const recentlyUnfollowedTab of recentlyUnfollowedTabsToDelete) {
            this.deleteRecentlyUnfollowedTab(recentlyUnfollowedTab);
        }
    }

    private sortTabListByUnfollowDateAsc(recentlyUnfollowedTabList: RecentlyUnfollowedTab[]) {
        recentlyUnfollowedTabList.sort((a, b) => {
            if (a.unfollowedAt.getTime() > b.unfollowedAt.getTime()) {
                return 1;
            } else if (a.unfollowedAt.getTime() < b.unfollowedAt.getTime()) {
                return -1;
            }

            return 0;
        });
    }
}
