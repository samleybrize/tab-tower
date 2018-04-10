import { Query } from '../../../bus/query-bus';
import { TabAssociation } from '../tab-association';

export class GetTabAssociationsWithOpenState implements Query<TabAssociation[]> {
    readonly resultType: TabAssociation[];
}
