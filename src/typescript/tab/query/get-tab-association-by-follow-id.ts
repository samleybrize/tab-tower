import { Query } from '../../bus/query-bus';
import { TabAssociation } from '../tab-association/tab-association';

export class GetTabAssociationByFollowId implements Query<TabAssociation> {
    readonly resultType: TabAssociation;

    constructor(public readonly followId: string) {
    }
}
