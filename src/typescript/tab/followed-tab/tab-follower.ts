import * as uuid from 'uuid';

import { EventBus } from '../../bus/event-bus';
import { FollowTab } from '../command/follow-tab';
import { TabFollowed } from '../event/tab-followed';
import { TabOpenState } from '../opened-tab/tab-open-state';
import { TabPersister } from '../persister/tab-persister';
import { TabAssociationMaintainer } from '../tab-association-maintainer';
import { TabFollowState } from './tab-follow-state';

export class TabFollower {
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
}
