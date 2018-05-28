export class OpenedTabDiscardStateUpdated {
    constructor(public readonly tabId: string, public readonly isDiscarded: boolean) {
    }
}
