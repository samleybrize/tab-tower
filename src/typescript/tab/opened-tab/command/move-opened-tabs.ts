export class MoveOpenedTabs {
    constructor(public readonly tabIdList: string[], public readonly targetPosition: number) {
    }
}
