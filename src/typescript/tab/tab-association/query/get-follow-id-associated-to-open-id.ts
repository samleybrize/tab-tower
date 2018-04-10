import { Query } from '../../../bus/query-bus';

export class GetFollowIdAssociatedToOpenId implements Query<string> {
    readonly resultType: string;

    constructor(public readonly openId: number) {
    }
}
