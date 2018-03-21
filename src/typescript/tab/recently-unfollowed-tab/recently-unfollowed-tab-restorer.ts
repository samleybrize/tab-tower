import { CommandBus } from '../../bus/command-bus';
import { QueryBus } from '../../bus/query-bus';
import { DeleteRecentlyUnfollowedTab } from '../command/delete-recently-unfollowed-tab';
import { RegisterTabFollowState } from '../command/register-tab-follow-state';
import { RestoreRecentlyUnfollowedTab } from '../command/restore-recently-unfollowed-tab';
import { GetRecentlyUnfollowedTabByFollowId } from '../query/get-recently-unfollowed-tabs-by-follow-id';

export class RecentlyUnfollowedTabRestorer {
    constructor(private commandBus: CommandBus, private queryBus: QueryBus) {
    }

    async restoreRecentlyUnfollowedTab(command: RestoreRecentlyUnfollowedTab) {
        const recentlyUnfollowedTab = await this.queryBus.query(new GetRecentlyUnfollowedTabByFollowId(command.followId));

        if (null == recentlyUnfollowedTab) {
            return;
        }

        await this.commandBus.handle(new RegisterTabFollowState(recentlyUnfollowedTab.followState));
        await this.commandBus.handle(new DeleteRecentlyUnfollowedTab(command.followId));
    }
}
