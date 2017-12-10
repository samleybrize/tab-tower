export class Tab {
    id: number = null;
    index: number = null;
    title: string = null;
    isIncognito: boolean = false;
    url: string = null;
    faviconUrl: string = null;
    isFollowed: boolean = false;
    isClosing: boolean = false; // TODO prevent direct modification

    get isOpened(): boolean {
        return null !== this.index && !this.isClosing;
    }

    markAsOpened(id: number, index: number) {
        this.id = id;
        this.index = index;
        this.isClosing = false;
    }

    markAsClosing() {
        this.isClosing = true;
    }

    markAsClosed() {
        this.id = null;
        this.index = null;
        this.isClosing = false;
    }
}
