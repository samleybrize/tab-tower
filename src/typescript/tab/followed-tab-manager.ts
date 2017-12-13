import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabFaviconUrlUpdated } from './event/open-tab-favicon-url-updated';
import { OpenTabTitleUpdated } from './event/open-tab-title-updated';
import { OpenTabUrlUpdated } from './event/open-tab-url-updated';
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
        this.tabPersister.persist(tabFollowState);
        this.eventBus.publish(new TabFollowed(tab));
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

    async onOpenTabMove(event: OpenTabMoved): Promise<void> {
        const tabFollowState = await this.tabPersister.getByIndex(event.tabOpenState.index);

        if (tabFollowState) {
            tabFollowState.openIndex = event.tabOpenState.index;
            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.faviconUrl = event.tabOpenState.faviconUrl;

            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.title = event.tabOpenState.title;

            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.url = event.tabOpenState.url;

            await this.tabPersister.persist(tabFollowState);
        }
    }

    // TODO onOpenTabReaderModeUpdate
}
