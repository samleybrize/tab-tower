import { Query } from '../../../bus/query-bus';
import { TabAssociation } from '../tab-association';

export class GetTabAssociationByOpenId implements Query<TabAssociation> {
    readonly resultType: TabAssociation;

    constructor(public readonly openId: number) {
    }
}
