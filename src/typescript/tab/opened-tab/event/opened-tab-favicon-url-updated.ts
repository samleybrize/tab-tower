export class OpenedTabFaviconUrlUpdated {
    constructor(public readonly tabId: string, public readonly faviconUrl: string) {
    }
}
