import { Query } from '../../bus/query-bus';
import { Tab } from '../tab';

export class GetFollowedTabs implements Query<Tab[]> {
    readonly resultType: Tab[];
}
