import { EventBus } from '../bus/event-bus';
import { OpenTabFaviconUrlUpdated } from './event/open-tab-favicon-url-updated';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabReaderModeStateUpdated } from './event/open-tab-reader-mode-state-updated';
import { OpenTabTitleUpdated } from './event/open-tab-title-updated';
import { OpenTabUrlUpdated } from './event/open-tab-url-updated';
import { TabClosed } from './event/tab-closed';
import { TabClosing } from './event/tab-closing';
import { TabOpened } from './event/tab-opened';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { TabCloser } from './tab-closer';
import { TabOpener } from './tab-opener';

export class NativeTabEventHandler {
    private isInited = false;

    constructor(
        private eventBus: EventBus,
        private openedTabRetriever: OpenedTabRetriever,
        private tabCloser: TabCloser,
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

        this.eventBus.publish(new TabOpened(tabOpenState));
        this.notifyTabMoveFromIndex(nativeTab.index + 1);
    }

    private async notifyTabMoveFromIndex(fromIndex: number) {
        const tabOpenStateList = await this.openedTabRetriever.getAll();

        for (const tabOpenState of tabOpenStateList) {
            if (tabOpenState.index >= fromIndex) {
                this.eventBus.publish(new OpenTabMoved(tabOpenState));
            }
        }
    }

    async onNativeTabClose(tabId: number, removeInfo: browser.tabs.RemoveInfo) {
        const closedTab = await this.openedTabRetriever.getById(tabId);

        await this.eventBus.publish(new TabClosing(tabId));
        await this.tabCloser.waitForTabClose(tabId);
        await this.eventBus.publish(new TabClosed(tabId));

        const closedTabIndex = closedTab ? closedTab.index : 0;
        this.notifyTabMoveFromIndex(closedTabIndex);
    }

    async onNativeTabMove(tabId: number, moveInfo: browser.tabs.MoveInfo) {
        const minIndex = Math.min(moveInfo.fromIndex, moveInfo.toIndex);
        this.notifyTabMoveFromIndex(minIndex);
    }

    async onNativeTabUpdate(tabId: number, updateInfo: browser.tabs.UpdateInfo) {
        const tabOpenState = await this.openedTabRetriever.getById(tabId);

        if (null == tabOpenState) {
            return;
        }

        if (updateInfo.title) {
            tabOpenState.title = updateInfo.title;
            this.eventBus.publish(new OpenTabTitleUpdated(tabOpenState));
        }

        if (updateInfo.url) {
            if (0 == updateInfo.url.indexOf('about:reader?')) {
                tabOpenState.isInReaderMode = true;

                let url = new URL(updateInfo.url).searchParams.get('url');
                url = decodeURI(url);
                tabOpenState.url = url;
            } else {
                tabOpenState.isInReaderMode = false;
            }

            this.eventBus.publish(new OpenTabReaderModeStateUpdated(tabOpenState));
            this.eventBus.publish(new OpenTabUrlUpdated(tabOpenState));
        }

        if (undefined !== updateInfo.favIconUrl) {
            tabOpenState.faviconUrl = updateInfo.favIconUrl;
            this.eventBus.publish(new OpenTabFaviconUrlUpdated(tabOpenState));
        }
    }
}
