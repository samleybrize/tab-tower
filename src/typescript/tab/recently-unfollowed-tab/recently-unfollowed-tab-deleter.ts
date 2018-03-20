import { DeleteRecentlyUnfollowedTab } from '../command/delete-recently-unfollowed-tab';
import { RecentlyUnfollowedTabPersister } from './persister/recently-unfollowed-tab-persister';

export class RecentlyUnfollowedTabDeleter {
    constructor(private persister: RecentlyUnfollowedTabPersister) {
    }

    async delete(command: DeleteRecentlyUnfollowedTab) {
        await this.persister.remove(command.followId);
    }

    // TODO purge
}
