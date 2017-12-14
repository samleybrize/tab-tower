import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
import { UnfollowTab } from './command/unfollow-tab';
import { OpenTabFaviconUrlUpdated } from './event/open-tab-favicon-url-updated';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabReaderModeStateUpdated } from './event/open-tab-reader-mode-state-updated';
import { OpenTabTitleUpdated } from './event/open-tab-title-updated';
import { OpenTabUrlUpdated } from './event/open-tab-url-updated';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { TabClosed } from './event/tab-closed';
import { TabFollowed } from './event/tab-followed';
import { TabUnfollowed } from './event/tab-unfollowed';
import { TabPersister } from './persister/tab-persister';

// TODO rename
export class FollowedTabManager {
    private openTabIdFollowIdAssociation = new Map<number, string>();

    constructor(private tabPersister: TabPersister, private eventBus: EventBus) {
    }

    async associateOpenedTab(tabFollowState: TabFollowState, tabOpenState: TabOpenState) {
        this.associateOpenedTabWithoutPersisting(tabFollowState, tabOpenState);
        await this.tabPersister.persist(tabFollowState);

        this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(tabOpenState, tabFollowState));
    }

    private associateOpenedTabWithoutPersisting(tabFollowState: TabFollowState, tabOpenState: TabOpenState) {
        if (null == tabFollowState || null == tabOpenState) {
            return;
        }

        this.openTabIdFollowIdAssociation.set(tabOpenState.id, tabFollowState.id);
        tabFollowState.openIndex = tabOpenState.index;
    }

    async followTab(command: FollowTab) {
        const tab = command.tab;

        if (tab.isFollowed || !tab.isOpened) {
            return;
        }

        const tabFollowState = this.createTabFollowStateFromOpenState(command.tab.openState);
        tab.followState = tabFollowState;
        await this.tabPersister.persist(tabFollowState);
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

        this.associateOpenedTabWithoutPersisting(followState, openState);

        return followState;
    }

    async unfollowTab(command: FollowTab) {
        const tab = command.tab;

        if (!tab.isFollowed) {
            return;
        }

        await this.tabPersister.remove(tab.followState);
        const oldFollowState = tab.followState;
        tab.followState = null;
        this.eventBus.publish(new TabUnfollowed(tab, oldFollowState));
    }

    async onTabClose(event: TabClosed): Promise<void> {
        const followId = this.openTabIdFollowIdAssociation.get(event.tabId);
        this.openTabIdFollowIdAssociation.delete(event.tabId);

        if (null == followId) {
            return;
        }

        const tabFollowState = await this.tabPersister.getByFollowId(followId);

        if (null == tabFollowState) {
            return;
        }

        tabFollowState.openIndex = null;
        this.tabPersister.persist(tabFollowState);
    }

    async onOpenTabMove(event: OpenTabMoved): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            tabFollowState.openIndex = event.tabOpenState.index;
            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.faviconUrl = event.tabOpenState.faviconUrl;

            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.title = event.tabOpenState.title;

            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.url = event.tabOpenState.url;

            await this.tabPersister.persist(tabFollowState);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            // TODO
            tabFollowState.isInReaderMode = event.tabOpenState.isInReaderMode;

            await this.tabPersister.persist(tabFollowState);
        }
    }
}
