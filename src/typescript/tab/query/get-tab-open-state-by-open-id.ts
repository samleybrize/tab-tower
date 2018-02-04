import { Query } from '../../bus/query-bus';
import { TabOpenState } from '../opened-tab/tab-open-state';

export class GetTabOpenStateByOpenId implements Query<TabOpenState> {
    readonly resultType: TabOpenState;

    constructor(public readonly openId: number) {
    }
}
