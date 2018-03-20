import { QueryBus } from '../../bus/query-bus';
import { RestoreRecentlyUnfollowedTab } from '../command/restore-recently-unfollowed-tab';

export class RecentlyUnfollowedTabRestorer {
    constructor(private queryBus: QueryBus) {
    }

    async restoreRecentlyUnfollowedTab(command: RestoreRecentlyUnfollowedTab) {
        // TODO
    }
}
