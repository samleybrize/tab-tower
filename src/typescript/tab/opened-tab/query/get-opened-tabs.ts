import { Query } from '../../../bus/query-bus';
import { OpenedTab } from '../opened-tab';

export class GetOpenedTabs implements Query<OpenedTab[]> {
    readonly resultType: OpenedTab[];
}
