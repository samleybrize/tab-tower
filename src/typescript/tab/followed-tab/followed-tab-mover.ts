import { EventBus } from '../../bus/event-bus';
import { MoveFollowedTabs } from '../command/move-followed-tabs';
import { FollowedTabMoved } from '../event/followed-tab-moved';
import { FollowedTabWeightCalculator } from './followed-tab-weight-calculator';
import { TabPersister } from './persister/tab-persister';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabMover {
    constructor(
        private tabPersister: TabPersister,
        private followedTabWeightCalculator: FollowedTabWeightCalculator,
        private eventBus: EventBus,
    ) {
    }

    async moveFollowedTabs(command: MoveFollowedTabs) {
        const moveBeforeFollowState = await this.getFollowState(command.moveBeforeFollowId);
        const moveAfterFollowState = await this.getFollowState(command.moveAfterFollowId);
        const newWeightList = this.followedTabWeightCalculator.getWeightBetweenTwoWeights(
            command.followIdToMoveList.length,
            moveAfterFollowState ? moveAfterFollowState.weight : null,
            moveBeforeFollowState ? moveBeforeFollowState.weight : null,
        );

        for (const followIdToMove of command.followIdToMoveList) {
            const followState = await this.tabPersister.getByFollowId(followIdToMove);

            const newWeight = newWeightList.shift();
            followState.weight = newWeight;
            this.tabPersister.setWeight(followIdToMove, newWeight);

            this.eventBus.publish(new FollowedTabMoved(followState));
        }
    }

    private async getFollowState(followId: string) {
        if (null == followId) {
            return null;
        }

        const followState = await this.tabPersister.getByFollowId(followId);

        if (null == followState) {
            console.error(`Unable to find a tab follow state with follow id "${followId}"`);

            return null;
        }

        return followState;
    }
}
