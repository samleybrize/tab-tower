import { Query } from '../../../bus/query-bus';
import { OpenedTab } from '../opened-tab';

// TODO remove
interface OpenedTabsFilter {
    readonly filterText: string;
    readonly matchOnTitle?: boolean;
    readonly matchOnUrl?: boolean;
    readonly matchOnUrlDomain?: boolean;
}

export class GetOpenedTabs implements Query<OpenedTab[]> {
    readonly resultType: OpenedTab[];

    // TODO remove
    constructor(public readonly filter?: OpenedTabsFilter) {
    }
}
