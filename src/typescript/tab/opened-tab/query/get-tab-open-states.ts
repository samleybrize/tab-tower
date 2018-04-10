import { Query } from '../../../bus/query-bus';
import { TabOpenState } from '../tab-open-state';

export class GetTabOpenStates implements Query<TabOpenState[]> {
    readonly resultType: TabOpenState[];
}
