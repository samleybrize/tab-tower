import { Query } from '../../bus/query-bus';
import { TabAssociation } from '../tab-association/tab-association';

export class GetTabByOpenId implements Query<TabAssociation> {
    readonly resultType: TabAssociation;

    constructor(public readonly openId: number) {
    }
}
