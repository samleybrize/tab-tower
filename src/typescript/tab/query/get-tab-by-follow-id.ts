import { Query } from '../../bus/query-bus';
import { Tab } from '../tab';

export class GetTabByFollowId implements Query<Tab> {
    readonly resultType: Tab;

    constructor(public readonly followId: string) {
    }
}
