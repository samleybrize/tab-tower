import { Query } from '../../../bus/query-bus';
import { TabTag } from '../tab-tag';

export class GetTabTags implements Query<TabTag[]> {
    readonly resultType: TabTag[];

    constructor(public readonly tagIdList?: string[]) {
    }
}
