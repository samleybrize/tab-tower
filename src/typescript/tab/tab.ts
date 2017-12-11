export class Tab {
    id: number = null;
    index: number = null;
    title: string = null;
    isIncognito: boolean = false;
    url: string = null;
    faviconUrl: string = null;
    isFollowed: boolean = false;

    get isOpened(): boolean {
        return null !== this.index;
    }

    markAsOpened(id: number, index: number) {
        this.id = id;
        this.index = index;
    }

    markAsClosed() {
        this.id = null;
        this.index = null;
    }
}
