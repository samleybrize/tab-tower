import { Query } from '../../../../bus/query-bus';

export class GetCurrentWorkspaceSelectedTabs implements Query<string[]> {
    readonly resultType: string[];
}
