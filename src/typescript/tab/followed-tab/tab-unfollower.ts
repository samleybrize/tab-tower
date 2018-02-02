import { EventBus } from '../../bus/event-bus';
import { UnfollowTab } from '../command/unfollow-tab';
import { TabUnfollowed } from '../event/tab-unfollowed';
import { TabPersister } from '../persister/tab-persister';

export class TabUnfollower {
    constructor(
        private tabPersister: TabPersister,
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
