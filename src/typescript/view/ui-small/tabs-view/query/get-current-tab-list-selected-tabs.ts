import { Query } from '../../../../bus/query-bus';

export class GetCurrentTabListSelectedTabs implements Query<string[]> {
    readonly resultType: string[];
}
