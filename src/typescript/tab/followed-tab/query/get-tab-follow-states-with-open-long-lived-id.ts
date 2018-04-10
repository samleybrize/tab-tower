import { Query } from '../../../bus/query-bus';
import { TabFollowState } from '../tab-follow-state';

export class GetTabFollowStatesWithOpenLongLivedId implements Query<Map<string, TabFollowState>> {
    readonly resultType: Map<string, TabFollowState>;
}
