import { Query } from '../../bus/query-bus';
import { TabAssociation } from '../tab-association';

export class GetFollowedTabs implements Query<TabAssociation[]> {
    readonly resultType: TabAssociation[];
}
