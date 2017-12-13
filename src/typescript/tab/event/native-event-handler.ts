import { OpenedTabManager } from '../opened-tab-manager';
import { OpenedTabRetriever } from '../opened-tab-retriever';
import { TabOpenState } from '../tab-open-state';

export class NativeEventHandler {
    private isInited = false;

    constructor(private openedTabManager: OpenedTabManager, private openedTabRetriever: OpenedTabRetriever) {
    }

    init() {
        if (this.isInited) {
            return;
        }

        this.isInited = true;
        browser.tabs.onCreated.addListener(this.onNativeTabCreate.bind(this));
        browser.tabs.onRemoved.addListener(this.onNativeTabClose.bind(this));
        browser.tabs.onMoved.addListener(this.onNativeTabMove.bind(this));
        browser.tabs.onUpdated.addListener(this.onNativeTabUpdate.bind(this));
    }

    async onNativeTabCreate(nativeTab: browser.tabs.Tab) {
        const tabOpenState = await this.openedTabRetriever.getById(nativeTab.id);
        this.openedTabManager.open(tabOpenState);
    }

    onNativeTabClose(tabId: number, removeInfo: browser.tabs.RemoveInfo) {
        this.openedTabManager.close(tabId);
    }

    async onNativeTabMove(tabId: number, moveInfo: browser.tabs.MoveInfo) {
        const tabOpenState = await this.openedTabRetriever.getById(tabId);

        if (tabOpenState) {
            this.openedTabManager.move(tabOpenState, moveInfo.toIndex);
        }
    }

    async onNativeTabUpdate(tabId: number, updateInfo: browser.tabs.UpdateInfo) {
        const tabOpenState = await this.openedTabRetriever.getById(tabId);

        if (null == tabOpenState) {
            return;
        }

        if (updateInfo.title) {
            this.openedTabManager.updateTitle(tabOpenState, updateInfo.title);
        }

        if (updateInfo.url) {
            this.openedTabManager.updateUrl(tabOpenState, updateInfo.url);
        }

        // TODO favicon url may be null to indicate that there is not
        if (updateInfo.favIconUrl) {
            this.openedTabManager.updateFaviconUrl(tabOpenState, updateInfo.favIconUrl);
        }
    }
}
