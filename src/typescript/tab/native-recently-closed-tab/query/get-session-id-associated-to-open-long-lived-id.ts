import { Query } from '../../../bus/query-bus';

export class GetSessionIdAssociatedToOpenLongLivedId implements Query<string> {
    readonly resultType: string;

    constructor(public readonly openLongLivedId: string) {
    }
}
