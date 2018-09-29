import { Query } from '../../../bus/query-bus';

export interface TabTagFilter {
    readonly filterText: string;
}

export class GetTabTagIdsThatMatchFilter implements Query<string[]> {
    readonly resultType: string[];

    constructor(public readonly filter: TabTagFilter, public readonly tagIdListToMatch?: string[]) {
    }
}
