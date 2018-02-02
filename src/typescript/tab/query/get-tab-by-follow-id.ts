import { Query } from '../../bus/query-bus';
import { TabAssociation } from '../tab-association';

export class GetTabByFollowId implements Query<TabAssociation> {
    readonly resultType: TabAssociation;

    constructor(public readonly followId: string) {
    }
}
