export class OpenedTabPinStateUpdated {
    constructor(public readonly tabId: string, public readonly isPinned: boolean) {
    }
}
