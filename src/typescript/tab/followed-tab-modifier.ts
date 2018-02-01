import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
import { UnfollowTab } from './command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './event/opened-tab-focused';
import { OpenedTabIsLoading } from './event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from './event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from './event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './event/opened-tab-url-updated';
import { TabClosed } from './event/tab-closed';
import { TabFollowed } from './event/tab-followed';
import { TabOpened } from './event/tab-opened';
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

        if (tab.followState || !tab.openState || tab.openState.isPrivileged) {
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
        followState.openLongLivedId = openState.longLivedId;
        followState.openLastAccess = openState.lastAccess;

        this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(openState.id, followState.id);

        return followState;
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

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        const followState = event.tabFollowState;
        followState.openLongLivedId = event.tabOpenState.longLivedId;
        followState.isInReaderMode = event.tabOpenState.isInReaderMode;
        await this.tabPersister.persist(followState);
    }

    async onTabOpen(event: TabOpened): Promise<void> {
        const associatedFollowedState = await this.tabPersister.getByOpenLongLivedId(event.tabOpenState.longLivedId);

        if (associatedFollowedState) {
            this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(event.tabOpenState.id, associatedFollowedState.id);
            this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(event.tabOpenState, associatedFollowedState));
        }
    }

    async onOpenedTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setFaviconUrl(followId, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenedTabTitleUpdate(event: OpenedTabTitleUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setTitle(followId, event.tabOpenState.title);
        }
    }

    async onOpenedTabUrlUpdate(event: OpenedTabUrlUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setUrl(followId, event.tabOpenState.url);
        }
    }

    async onOpenedTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setReaderMode(followId, event.tabOpenState.isInReaderMode);
        }
    }

    async onOpenedTabFocus(event: OpenedTabFocused) {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setOpenLastAccess(followId, event.tabOpenState.lastAccess);
        }
    }
}
