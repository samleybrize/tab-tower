import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
import { UnfollowTab } from './command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './event/opened-tab-favicon-url-updated';
import { OpenedTabMoved } from './event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './event/opened-tab-url-updated';
import { TabClosed } from './event/tab-closed';
import { TabFollowed } from './event/tab-followed';
import { TabUnfollowed } from './event/tab-unfollowed';
import { TabPersister } from './persister/tab-persister';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class FollowedTabModifier {
    constructor(
        private tabPersister: TabPersister,
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private eventBus: EventBus,
    ) {
    }

    async followTab(command: FollowTab) {
        const tab = command.tab;

        if (tab.isFollowed || !tab.isOpened || tab.openState.isPrivileged) {
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

        this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(openState.id, followState.id);

        return followState;
    }

    async unfollowTab(command: UnfollowTab) {
        const tab = command.tab;

        if (!tab.isFollowed) {
            return;
        }

        await this.tabPersister.remove(tab.followState.id);
        const oldFollowState = tab.followState;
        tab.followState = null;
        this.eventBus.publish(new TabUnfollowed(tab.openState, oldFollowState));
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followState = event.tabFollowState;
        followState.openIndex = event.tabOpenState.index;
        await this.tabPersister.persist(followState);
    }

    async onTabClose(event: TabClosed): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabId);

        if (followId) {
            await this.tabPersister.setOpenIndex(followId, null);
        }
    }

    async onOpenTabMove(event: OpenedTabMoved): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setOpenIndex(followId, event.tabOpenState.index);
        }
    }

    async onOpenTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setFaviconUrl(followId, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenTabTitleUpdate(event: OpenedTabTitleUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setTitle(followId, event.tabOpenState.title);
        }
    }

    async onOpenTabUrlUpdate(event: OpenedTabUrlUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setUrl(followId, event.tabOpenState.url);
        }
    }

    async onOpenTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setReaderMode(followId, event.tabOpenState.isInReaderMode);
        }
    }
}
