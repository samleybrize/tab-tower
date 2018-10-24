import { Query } from '../../../bus/query-bus';

export class GetTabCountForAllTags implements Query<Map<string, number>> {
    readonly resultType: Map<string, number>;
}
