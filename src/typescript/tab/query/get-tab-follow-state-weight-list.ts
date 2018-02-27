import { Query } from '../../bus/query-bus';
import { TabFollowState } from '../followed-tab/tab-follow-state';

export class GetTabFollowStateWeightList implements Query<number[]> {
    readonly resultType: number[];
}
