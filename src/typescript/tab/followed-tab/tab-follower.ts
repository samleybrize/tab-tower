import * as uuid from 'uuid';

import { CommandBus } from '../../bus/command-bus';
import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { AssociateOpenedTabToFollowedTab } from '../command/associate-opened-tab-to-followed-tab';
import { FollowTab } from '../command/follow-tab';
import { TabFollowed } from '../event/tab-followed';
import { TabOpenState } from '../opened-tab/tab-open-state';
import { GetTabFollowStateWeightList } from '../query/get-tab-follow-state-weight-list';
import { FollowedTabWeightCalculator } from './followed-tab-weight-calculator';
import { FollowStatePersister } from './persister/follow-state-persister';
import { TabFollowState } from './tab-follow-state';

export class TabFollower {
    constructor(
        private tabPersister: FollowStatePersister,
        private followedTabWeightCalculator: FollowedTabWeightCalculator,
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
    ) {
    }

    async followTab(command: FollowTab) {
        const tab = command.tab;

        if (tab.followState || !tab.openState || tab.openState.isPrivileged) {
            return;
        }

        const tabFollowState = await this.createTabFollowStateFromOpenState(command.tab.openState);
        tab.followState = tabFollowState;
        await this.tabPersister.persist(tabFollowState);
        this.eventBus.publish(new TabFollowed(tab));

        await this.commandBus.handle(new AssociateOpenedTabToFollowedTab(tab.openState, tab.followState));
    }

    private async createTabFollowStateFromOpenState(openState: TabOpenState): Promise<TabFollowState> {
        const followState = new TabFollowState();
        followState.id = uuid.v1();
        followState.title = openState.title;
        followState.isIncognito = openState.isIncognito;
        followState.isInReaderMode = openState.isInReaderMode;
        followState.isAudioMuted = openState.isAudioMuted;
        followState.url = openState.url;
        followState.faviconUrl = openState.faviconUrl;
        followState.openLongLivedId = openState.longLivedId;
        followState.openLastAccess = openState.lastAccess;
        followState.weight = await this.getLowestFollowStateWeight();

        return followState;
    }

    private async getLowestFollowStateWeight() {
        const weightList = await this.queryBus.query(new GetTabFollowStateWeightList());
        const lowestWeight = weightList.length ? Math.min(...weightList) : null;
        const weight = this.followedTabWeightCalculator.getWeightBeforeWeight(1, lowestWeight);

        return weight.shift();
    }
}
