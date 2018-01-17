export class NativeRecentlyClosedTabAssociation {
    public associatedOpenedTabLongLivedId: string = null;
    public isIgnored: boolean = false;

    constructor(public readonly uniqueId: string, public readonly url: string, public readonly faviconUrl: string) {
    }
}
