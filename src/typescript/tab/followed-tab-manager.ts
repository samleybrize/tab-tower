import { EventBus } from '../bus/event-bus';
import { FollowTab } from './command/follow-tab';
import { TabClosed } from './event/tab-closed';
import { TabFollowed } from './event/tab-followed';
import { TabMoved } from './event/tab-moved';
import { TabUpdated } from './event/tab-updated';
import { TabPersister } from './persister/tab-persister';

// TODO rename
export class FollowedTabManager {
    constructor(private tabPersister: TabPersister, private eventBus: EventBus) {
    }

    async followTab(command: FollowTab) {
        this.tabPersister.add(command.tab);
        this.eventBus.publish(new TabFollowed(command.tab));
    }

    onTabClose(event: TabClosed): Promise<void> {
        // TODO mark the tab as closed
    }

    onTabMove(event: TabMoved): Promise<void> {
        // TODO update tab index
    }

    onTabUpdate(event: TabUpdated): Promise<void> {
        // TODO update title, url, favicon url, reader mode?, private mode?
    }

    onTabFollow(event: TabFollowed): Promise<void> {
        // TODO persist tab
    }
}
