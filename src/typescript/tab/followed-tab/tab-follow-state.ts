export class TabFollowState {
    id: string;
    position: number;
    title: string = null;
    isIncognito: boolean = false;
    isInReaderMode: boolean = false;
    isAudioMuted: boolean = false;
    url: string = null;
    faviconUrl: string = null;
    openLongLivedId: string = null;
    openLastAccess: Date = null;

    static fromObject(sourceObject: any): TabFollowState {
        const followState = new TabFollowState();
        followState.id = sourceObject.id;
        followState.position = sourceObject.position;
        followState.title = sourceObject.title;
        followState.isIncognito = sourceObject.isIncognito;
        followState.isInReaderMode = sourceObject.isInReaderMode;
        followState.isAudioMuted = sourceObject.isAudioMuted;
        followState.url = sourceObject.url;
        followState.faviconUrl = sourceObject.faviconUrl;
        followState.openLongLivedId = sourceObject.openLongLivedId;
        followState.openLastAccess = sourceObject.openLastAccess;

        return followState;
    }
}
