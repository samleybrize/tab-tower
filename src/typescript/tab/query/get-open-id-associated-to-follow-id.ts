import { Query } from '../../bus/query-bus';

export class GetOpenIdAssociatedToFollowId implements Query<number> {
    readonly resultType: number;

    constructor(public readonly followId: string) {
    }
}
