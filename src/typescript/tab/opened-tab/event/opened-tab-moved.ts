export class OpenedTabMoved {
    constructor(public readonly tabId: string, public readonly position: number) {
    }
}
