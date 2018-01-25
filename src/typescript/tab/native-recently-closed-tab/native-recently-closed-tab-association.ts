export class NativeRecentlyClosedTabAssociation {
    public associatedOpenedTabLongLivedId: string = null;
    public isIgnored: boolean = false;

    constructor(
        public readonly uniqueId: string,
        public readonly sessionId: string,
        public readonly url: string,
        public readonly faviconUrl: string,
    ) {
    }

    static fromObject(sourceObject: any): NativeRecentlyClosedTabAssociation {
        const association = new NativeRecentlyClosedTabAssociation(
            sourceObject.uniqueId,
            sourceObject.sessionId,
            sourceObject.url,
            sourceObject.faviconUrl,
        );
        association.associatedOpenedTabLongLivedId = sourceObject.associatedOpenedTabLongLivedId;
        association.isIgnored = sourceObject.isIgnored;

        return association;
    }
}
