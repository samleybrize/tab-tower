import { Query } from '../../../bus/query-bus';
import { TabTag } from '../tab-tag';

export class GetTabTagById implements Query<TabTag> {
    readonly resultType: TabTag;

    constructor(public readonly tagId: string) {
    }
}
