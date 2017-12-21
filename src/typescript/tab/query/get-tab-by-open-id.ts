import { Query } from '../../bus/query-bus';
import { Tab } from '../tab';

export class GetTabByOpenId implements Query<Tab> {
    readonly resultType: Tab;

    constructor(public readonly openId: number) {
    }
}
