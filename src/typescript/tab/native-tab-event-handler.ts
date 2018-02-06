import { EventBus } from '../bus/event-bus';
import { QueryBus } from '../bus/query-bus';
import { OpenedTabFaviconUrlUpdated } from './event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './event/opened-tab-focused';
import { OpenedTabIsLoading } from './event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from './event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from './event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './event/opened-tab-url-updated';
import { TabCloseHandled } from './event/tab-close-handled';
import { TabClosed } from './event/tab-closed';
import { TabOpened } from './event/tab-opened';
import { GetClosedTabOpenStateByOpenId } from './query/get-closed-tab-open-state-by-open-id';
import { GetTabOpenStateByOpenId } from './query/get-tab-open-state-by-open-id';
import { GetTabOpenStates } from './query/get-tab-open-states';
import { TabCloser } from './tab-closer';
import { TabOpener } from './tab-opener';

export class NativeTabEventHandler {
    private isInited = false;

    constructor(
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private tabCloser: TabCloser,
        private tabOpener: TabOpener,
    ) {
    }

    init() {
        if (this.isInited) {
            return;
        }

        this.isInited = true;
        browser.tabs.onActivated.addListener(this.onTabActivated.bind(this));
        browser.tabs.onCreated.addListener(this.onNativeTabCreate.bind(this));
        browser.tabs.onMoved.addListener(this.onNativeTabMove.bind(this));
        browser.tabs.onRemoved.addListener(this.onNativeTabClose.bind(this));
        browser.tabs.onUpdated.addListener(this.onNativeTabUpdate.bind(this));
    }

    async onNativeTabCreate(nativeTab: browser.tabs.Tab) {
        await this.tabOpener.waitForNewTabLoad(nativeTab.id);
        const tabOpenState = await this.queryBus.query(new GetTabOpenStateByOpenId(nativeTab.id));

        if (tabOpenState) {
            this.eventBus.publish(new TabOpened(tabOpenState));
            this.notifyTabMoveFromIndex(nativeTab.index + 1);
        }
    }

    private async notifyTabMoveFromIndex(fromIndex: number) {
        const tabOpenStateList = await this.queryBus.query(new GetTabOpenStates());

        for (const tabOpenState of tabOpenStateList) {
            if (tabOpenState.index >= fromIndex) {
                this.eventBus.publish(new OpenedTabMoved(tabOpenState));
            }
        }
    }

    private async onTabActivated(activatedInfo: browser.tabs.ActivatedInfo) {
        const tabOpenState = await this.queryBus.query(new GetTabOpenStateByOpenId(activatedInfo.tabId));

        if (tabOpenState) {
            this.eventBus.publish(new OpenedTabFocused(tabOpenState));
        }
    }

    async onNativeTabClose(tabId: number, removeInfo: browser.tabs.RemoveInfo) {
        const closedTab = await this.queryBus.query(new GetClosedTabOpenStateByOpenId(tabId));

        if (null == closedTab) {
            return;
        }

        await this.tabCloser.waitForTabClose(tabId);
        await this.eventBus.publish(new TabClosed(closedTab));
        await this.eventBus.publish(new TabCloseHandled(closedTab));

        const closedTabIndex = closedTab ? closedTab.index : 0;
        this.notifyTabMoveFromIndex(closedTabIndex);
    }

    async onNativeTabMove(tabId: number, moveInfo: browser.tabs.MoveInfo) {
        const minIndex = Math.min(moveInfo.fromIndex, moveInfo.toIndex);
        this.notifyTabMoveFromIndex(minIndex);
    }

    async onNativeTabUpdate(tabId: number, updateInfo: browser.tabs.UpdateInfo) {
        const tabOpenState = await this.queryBus.query(new GetTabOpenStateByOpenId(tabId));

        if (null == tabOpenState) {
            return;
        }

        if ('loading' == updateInfo.status) {
            this.eventBus.publish(new OpenedTabIsLoading(tabOpenState));
        } else if ('complete' == updateInfo.status) {
            this.eventBus.publish(new OpenedTabLoadingIsComplete(tabOpenState));
        }

        if (updateInfo.title) {
            tabOpenState.title = updateInfo.title;
            this.eventBus.publish(new OpenedTabTitleUpdated(tabOpenState));
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

            this.eventBus.publish(new OpenedTabReaderModeStateUpdated(tabOpenState));
            this.eventBus.publish(new OpenedTabUrlUpdated(tabOpenState));
        }

        if (undefined !== updateInfo.favIconUrl) {
            tabOpenState.faviconUrl = updateInfo.favIconUrl;
            this.eventBus.publish(new OpenedTabFaviconUrlUpdated(tabOpenState));
        }
    }
}
