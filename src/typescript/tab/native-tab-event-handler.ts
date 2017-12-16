import { OpenedTabManager } from './opened-tab-manager';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { TabOpener } from './tab-opener';

export class NativeTabEventHandler {
    private isInited = false;

    constructor(
        private openedTabManager: OpenedTabManager,
        private openedTabRetriever: OpenedTabRetriever,
        private tabOpener: TabOpener,
    ) {
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
        await this.tabOpener.waitForNewTabLoad(nativeTab.id);
        const tabOpenState = await this.openedTabRetriever.getById(nativeTab.id);
        this.openedTabManager.nativeTabOpened(tabOpenState);
    }

    onNativeTabClose(tabId: number, removeInfo: browser.tabs.RemoveInfo) {
        this.openedTabManager.nativeTabClosed(tabId);
    }

    async onNativeTabMove(tabId: number, moveInfo: browser.tabs.MoveInfo) {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const minIndex = Math.min(moveInfo.fromIndex, moveInfo.toIndex);

        for (const tabOpenState of tabOpenStateList) {
            if (tabOpenState.index >= minIndex) {
                this.openedTabManager.nativeTabMoved(tabOpenState, tabOpenState.index);
            }
        }
    }

    async onNativeTabUpdate(tabId: number, updateInfo: browser.tabs.UpdateInfo) {
        const tabOpenState = await this.openedTabRetriever.getById(tabId);

        if (null == tabOpenState) {
            return;
        }

        if (updateInfo.title) {
            this.openedTabManager.nativeTabTitleUpdated(tabOpenState, updateInfo.title);
        }

        if (updateInfo.url) {
            let url = updateInfo.url;

            if (0 == updateInfo.url.indexOf('about:reader?')) {
                this.openedTabManager.nativeTabReaderModeStateUpdated(tabOpenState, true);

                url = new URL(url).searchParams.get('url');
                url = decodeURI(url);
            } else {
                this.openedTabManager.nativeTabReaderModeStateUpdated(tabOpenState, false);
            }

            this.openedTabManager.nativeTabUrlUpdated(tabOpenState, url);
        }

        if (undefined !== updateInfo.favIconUrl) {
            this.openedTabManager.nativeTabFaviconUrlUpdated(tabOpenState, updateInfo.favIconUrl);
        }
    }
}
