import { EventBus } from '../bus/event-bus';
import { FollowTab } from './command/follow-tab';
import { TabFollowed } from './event/tab-followed';
import { TabPersister } from './persister/tab-persister';

// TODO rename
export class FollowedTabManager {
    constructor(private tabPersister: TabPersister, private eventBus: EventBus) {
    }

    async followTab(command: FollowTab) {
        this.tabPersister.add(command.tab);
        this.eventBus.publish(new TabFollowed(command.tab));
    }
}
