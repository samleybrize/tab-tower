import { Query } from '../../../bus/query-bus';

export interface OpenedTabsFilter {
    readonly filterText: string;
    readonly matchOnTitle?: boolean;
    readonly matchOnUrl?: boolean;
    readonly matchOnUrlDomain?: boolean;
}

export class GetOpenedTabIdsThatMatchFilter implements Query<string[]> {
    readonly resultType: string[];

    constructor(public readonly filter: OpenedTabsFilter, public readonly tabIdListToMatch?: string[]) {
    }
}
