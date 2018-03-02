import { Query } from '../../bus/query-bus';

export class GetTabFollowStateWeightList implements Query<number[]> {
    readonly resultType: number[];
}
