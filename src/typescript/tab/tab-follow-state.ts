export class TabFollowState {
    id: string;
    title: string = null;
    isIncognito: boolean = false;
    isInReaderMode: boolean = false;
    url: string = null;
    faviconUrl: string = null;
    openIndex: number = null;

    static fromObject(sourceObject: any): TabFollowState {
        const followState = new TabFollowState();
        followState.id = sourceObject.id;
        followState.title = sourceObject.title;
        followState.isIncognito = sourceObject.isIncognito;
        followState.isInReaderMode = sourceObject.isInReaderMode;
        followState.url = sourceObject.url;
        followState.faviconUrl = sourceObject.faviconUrl;
        followState.openIndex = sourceObject.openIndex;

        return followState;
    }
}
