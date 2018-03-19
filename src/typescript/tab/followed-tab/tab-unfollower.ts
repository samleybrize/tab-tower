import { EventBus } from '../../bus/event-bus';
import { UnfollowTab } from '../command/unfollow-tab';
import { TabUnfollowed } from '../event/tab-unfollowed';
import { FollowStatePersister } from './persister/follow-state-persister';

export class TabUnfollower {
    constructor(
        private tabPersister: FollowStatePersister,
        private eventBus: EventBus,
    ) {
    }

    async unfollowTab(command: UnfollowTab) {
        const tab = command.tab;

        if (!tab.followState) {
            return;
        }

        await this.tabPersister.remove(tab.followState.id);
        const oldFollowState = tab.followState;
        tab.followState = null;
        this.eventBus.publish(new TabUnfollowed(tab.openState, oldFollowState));
    }
}
