export class OpenedTabAudibleStateUpdated {
    constructor(public readonly tabId: string, public readonly isAudible: boolean) {
    }
}
