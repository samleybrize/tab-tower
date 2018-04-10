import { Query } from '../../../bus/query-bus';
import { TabFollowState } from '../tab-follow-state';

export class GetTabFollowStates implements Query<TabFollowState[]> {
    readonly resultType: TabFollowState[];
}
