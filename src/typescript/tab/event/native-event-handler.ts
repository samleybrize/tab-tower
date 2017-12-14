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
        console.log('aze'); // TODO
        const tabOpenState = await this.openedTabRetriever.getById(nativeTab.id);
        this.openedTabManager.open(tabOpenState);
    }

    onNativeTabClose(tabId: number, removeInfo: browser.tabs.RemoveInfo) {
        this.openedTabManager.close(tabId);
    }

    async onNativeTabMove(tabId: number, moveInfo: browser.tabs.MoveInfo) {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const minIndex = Math.min(moveInfo.fromIndex, moveInfo.toIndex);

        for (const tabOpenState of tabOpenStateList) {
            if (tabOpenState.index >= minIndex) {
                this.openedTabManager.move(tabOpenState, tabOpenState.index);
            }
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
            let url = updateInfo.url;

            if (0 == updateInfo.url.indexOf('about:reader?')) {
                this.openedTabManager.updateReaderModeState(tabOpenState, true);

                url = new URL(url).searchParams.get('url');
                url = decodeURI(url);
            } else {
                this.openedTabManager.updateReaderModeState(tabOpenState, false);
            }

            this.openedTabManager.updateUrl(tabOpenState, url);
        }

        if (undefined !== updateInfo.favIconUrl) {
            this.openedTabManager.updateFaviconUrl(tabOpenState, updateInfo.favIconUrl);
        }
    }
}
