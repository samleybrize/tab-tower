export class MoveFollowedTabs {
    constructor(public readonly followIdToMoveList: string[], public readonly moveAfterFollowId?: string, public readonly moveBeforeFollowId?: string) {
    }
}
