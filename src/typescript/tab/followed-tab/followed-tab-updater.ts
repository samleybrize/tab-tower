import * as uuid from 'uuid';

import { EventBus } from '../../bus/event-bus';
import { OpenedTabAssociatedToFollowedTab } from '../event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from '../event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../event/opened-tab-focused';
import { OpenedTabIsLoading } from '../event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from '../event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from '../event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from '../event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../event/opened-tab-url-updated';
import { TabOpened } from '../event/tab-opened';
import { TabPersister } from '../persister/tab-persister';
import { TabAssociationMaintainer } from '../tab-association/tab-association-maintainer';

export class FollowedTabUpdater {
    constructor(
        private tabPersister: TabPersister,
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private eventBus: EventBus,
    ) {
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
            this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(event.tabOpenState, associatedFollowedState); // TODO command
        }
    }

    async onOpenedTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id); // TODO query

        if (followId) {
            await this.tabPersister.setFaviconUrl(followId, event.tabOpenState.faviconUrl);
        }
    }

    async onOpenedTabTitleUpdate(event: OpenedTabTitleUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id); // TODO query

        if (followId) {
            await this.tabPersister.setTitle(followId, event.tabOpenState.title);
        }
    }

    async onOpenedTabUrlUpdate(event: OpenedTabUrlUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id); // TODO query

        if (followId) {
            await this.tabPersister.setUrl(followId, event.tabOpenState.url);
        }
    }

    async onOpenedTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated): Promise<void> {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id); // TODO query

        if (followId) {
            await this.tabPersister.setReaderMode(followId, event.tabOpenState.isInReaderMode);
        }
    }

    async onOpenedTabFocus(event: OpenedTabFocused) {
        if (event.tabOpenState.isPrivileged) {
            return;
        }

        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id); // TODO query

        if (followId) {
            await this.tabPersister.setOpenLastAccess(followId, event.tabOpenState.lastAccess);
        }
    }
}
