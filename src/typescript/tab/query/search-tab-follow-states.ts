import { Query } from '../../bus/query-bus';
import { TabFollowState } from '../followed-tab/tab-follow-state';

export class SearchTabFollowStates implements Query<TabFollowState[]> {
    readonly resultType: TabFollowState[];

    constructor(public readonly matchOnTitle: string, public readonly matchOnUrl: string) {
    }
}
