import { Query } from '../../../bus/query-bus';
import { OpenedTab } from '../opened-tab';

export class GetOpenedTabById implements Query<OpenedTab> {
    readonly resultType: OpenedTab;

    constructor(public readonly tabId: string) {
    }
}
