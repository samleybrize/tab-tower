import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
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
        this.associateOpenedTabWithoutPersistingNorEvent(tabFollowState, tabOpenState);
        await this.tabPersister.setOpenIndex(tabFollowState.id, tabFollowState.openIndex);

        this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(tabOpenState, tabFollowState));
    }

    private associateOpenedTabWithoutPersistingNorEvent(tabFollowState: TabFollowState, tabOpenState: TabOpenState) {
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

        this.associateOpenedTabWithoutPersistingNorEvent(followState, openState);

        return followState;
    }

    async unfollowTab(command: FollowTab) {
        const tab = command.tab;

        if (!tab.isFollowed) {
            return;
        }

        await this.tabPersister.remove(tab.followState.id);
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
        await this.tabPersister.setOpenIndex(tabFollowState.id, null);
    }

    async onOpenTabMove(event: OpenTabMoved): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            await this.tabPersister.setOpenIndex(tabFollowState.id, event.tabOpenState.index);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenTabFaviconUrlUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            await this.tabPersister.setFaviconUrl(tabFollowState.id, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenTabTitleUpdate(event: OpenTabTitleUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            await this.tabPersister.setTitle(tabFollowState.id, event.tabOpenState.title);
        }
    }

    async onOpenTabUrlUpdate(event: OpenTabUrlUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            await this.tabPersister.setUrl(tabFollowState.id, event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenTabReaderModeStateUpdated): Promise<void> {
        const tabFollowState = await this.tabPersister.getByOpenIndex(event.tabOpenState.index);

        if (tabFollowState) {
            await this.tabPersister.setReaderMode(tabFollowState.id, event.tabOpenState.isInReaderMode);
        }
    }
}
