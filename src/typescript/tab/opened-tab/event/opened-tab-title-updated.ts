export class OpenedTabTitleUpdated {
    constructor(public readonly tabId: string, public readonly title: string) {
    }
}
