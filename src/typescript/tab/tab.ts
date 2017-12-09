export class Tab {
    id: string = null;
    index: number = null;
    title: string = null;
    isIncognito: boolean = null;
    url: string = null;
    faviconUrl: string = null;
    isFollowed: boolean = null;

    get isOpened(): boolean {
        return null !== this.index;
    }
}
