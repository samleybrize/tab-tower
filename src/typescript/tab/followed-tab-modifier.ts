import * as uuid from 'uuid';

import { EventBus } from '../bus/event-bus';
import { TabFollowState } from '../tab/tab-follow-state';
import { TabOpenState } from '../tab/tab-open-state';
import { FollowTab } from './command/follow-tab';
import { UnfollowTab } from './command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './event/opened-tab-favicon-url-updated';
import { OpenedTabIsLoading } from './event/opened-tab-is-loading';
import { OpenedTabMoved } from './event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './event/opened-tab-url-updated';
import { TabClosed } from './event/tab-closed';
import { TabFollowed } from './event/tab-followed';
import { TabUnfollowed } from './event/tab-unfollowed';
import { TabPersister } from './persister/tab-persister';
import { PrivilegedUrlDetector } from './privileged-url-detector';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class FollowedTabModifier {
    private updatesDisabledOnId = new Map<string, boolean>();
    private eventStackEnabledOnId = new Map<string, boolean>();
    private eventStack = new Map<string, Array<() => any>>();

    constructor(
        private tabPersister: TabPersister,
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private eventBus: EventBus,
        private privilegedUrlDetector: PrivilegedUrlDetector,
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
        followState.openIndex = openState.index;

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
        followState.openIndex = event.tabOpenState.index;
        await this.tabPersister.persist(followState);
    }

    async onTabClose(event: TabClosed): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabId);

        if (followId) {
            await this.tabPersister.setOpenIndex(followId, null);
        }
    }

    async onOpenedTabMove(event: OpenedTabMoved): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            await this.tabPersister.setOpenIndex(followId, event.tabOpenState.index);
        }
    }

    async onOpenedTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (null == followId || this.areUpdatesDisabled(followId)) {
            return;
        } else if (this.isEventStackEnabled(followId)) {
            this.stackEvent(followId, this.onOpenedTabFaviconUrlUpdate.bind(this, event));
            return;
        }

        await this.tabPersister.setFaviconUrl(followId, event.tabOpenState.faviconUrl);
    }

    private areUpdatesDisabled(followId: string) {
        return this.updatesDisabledOnId.get(followId);
    }

    private isEventStackEnabled(followId: string) {
        return this.eventStackEnabledOnId.get(followId);
    }

    private stackEvent(followId: string, callback: () => Promise<void>) {
        let eventStack = this.eventStack.get(followId);

        if (null == eventStack) {
            eventStack = [];
            this.eventStack.set(followId, eventStack);
        }

        eventStack.push(callback);
    }

    async onOpenedTabTitleUpdate(event: OpenedTabTitleUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (null == followId || this.areUpdatesDisabled(followId)) {
            return;
        } else if (this.isEventStackEnabled(followId)) {
            this.stackEvent(followId, this.onOpenedTabTitleUpdate.bind(this, event));
            return;
        }

        await this.tabPersister.setTitle(followId, event.tabOpenState.title);
    }

    async onOpenedTabUrlUpdate(event: OpenedTabUrlUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (null == followId) {
            return;
        }

        this.eventStackEnabledOnId.delete(followId);

        if (this.privilegedUrlDetector.isPrivileged(event.tabOpenState.url)) {
            this.updatesDisabledOnId.set(followId, true);
            this.eventStack.delete(followId);
        } else {
            this.updatesDisabledOnId.delete(followId);
            await this.playStackedEvents(followId);
            await this.tabPersister.setUrl(followId, event.tabOpenState.url);
        }
    }

    private async playStackedEvents(followId: string) {
        const stackedEvents = this.eventStack.get(followId);

        if (null == stackedEvents || 0 == stackedEvents.length) {
            return;
        }

        for (const event of stackedEvents) {
            await event();
        }

        this.eventStack.delete(followId);
    }

    async onOpenedTabReaderModeStateUpdate(event: OpenedTabReaderModeStateUpdated): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (null == followId || this.areUpdatesDisabled(followId)) {
            return;
        } else if (this.isEventStackEnabled(followId)) {
            this.stackEvent(followId, this.onOpenedTabReaderModeStateUpdate.bind(this, event));
            return;
        }

        await this.tabPersister.setReaderMode(followId, event.tabOpenState.isInReaderMode);
    }

    async onOpenedTabIsLoading(event: OpenedTabIsLoading): Promise<void> {
        const followId = this.tabAssociationMaintainer.getAssociatedFollowId(event.tabOpenState.id);

        if (followId) {
            this.eventStackEnabledOnId.set(followId, true);
        }
    }
}
