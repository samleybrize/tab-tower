import { Query } from '../../../bus/query-bus';
import { TabOpenState } from '../tab-open-state';

export class GetTabOpenStateByOpenLongLivedId implements Query<TabOpenState> {
    readonly resultType: TabOpenState;

    constructor(public readonly openLongLivedId: string) {
    }
}
