export class OpenedTabUrlUpdated {
    constructor(public readonly tabId: string, public readonly url: string) {
    }
}
