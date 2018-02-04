import { Query } from '../../bus/query-bus';
import { TabFollowState } from '../followed-tab/tab-follow-state';

export class GetTabFollowStateByFollowId implements Query<TabFollowState> {
    readonly resultType: TabFollowState;

    constructor(public readonly followId: string) {
    }
}
