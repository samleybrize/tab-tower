import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabUpdated } from './event/open-tab-updated';
import { TabClosed } from './event/tab-closed';
import { TabFollowed } from './event/tab-followed';
import { TabPersister } from './persister/tab-persister';

// TODO rename
export class FollowedTabManager {
    constructor(private tabPersister: TabPersister, private eventBus: EventBus) {
    }

    async followTab(command: FollowTab) {
        const tab = command.tab;

        if (tab.isFollowed || !tab.isOpened) {
            return;
        }

        const tabFollowState = this.createTabFollowStateFromOpenState(command.tab.openState);
        tab.followState = tabFollowState;
        this.tabPersister.add(tabFollowState);
        this.eventBus.publish(new TabFollowed(command.tab));
    }

    private createTabFollowStateFromOpenState(openState: TabOpenState): TabFollowState {
        const followState = new TabFollowState();
        followState.id = uuid.v1();
        followState.title = openState.title;
        followState.isIncognito = openState.isIncognito;
        followState.isInReaderMode = openState.isInReaderMode;
        followState.url = openState.url;
        followState.faviconUrl = openState.faviconUrl;
        followState.openIndex = openState.index;

        return followState;
    }

    // onTabClose(event: TabClosed): Promise<void> {
    //     // TODO mark the tab as closed
    // }

    // onOpenTabMove(event: OpenTabMoved): Promise<void> {
    //     // TODO update tab index
    // }

    // onOpenTabUpdate(event: OpenTabUpdated): Promise<void> {
    //     // TODO update title, url, favicon url, reader mode?, private mode?
    // }

    // onTabFollow(event: TabFollowed): Promise<void> {
    //     // TODO persist tab
    // }
}
