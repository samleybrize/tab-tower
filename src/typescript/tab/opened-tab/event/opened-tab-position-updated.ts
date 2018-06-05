export class OpenedTabPositionUpdated {
    constructor(public readonly tabId: string, public readonly position: number) {
    }
}
