import { Query } from '../../bus/query-bus';
import { Tab } from '../tab';

export class GetOpenedTabs implements Query<Tab[]> {
    readonly resultType: Tab[];
}
