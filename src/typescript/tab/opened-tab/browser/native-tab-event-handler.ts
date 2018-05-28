import * as uuid from 'uuid';

import { EventBus } from '../../../bus/event-bus';
import { QueryBus } from '../../../bus/query-bus';
import { sleep } from '../../../utils/sleep';
import { TaskScheduler } from '../../../utils/task-scheduler';
import { OpenedTabAudibleStateUpdated } from '../event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../event/opened-tab-audio-mute-state-updated';
import { OpenedTabClosed } from '../event/opened-tab-closed';
import { OpenedTabDiscardStateUpdated } from '../event/opened-tab-discard-state-updated';
import { OpenedTabFaviconUrlUpdated } from '../event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../event/opened-tab-focused';
import { OpenedTabIsLoading } from '../event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from '../event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from '../event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../event/opened-tab-pin-state-updated';
import { OpenedTabTitleUpdated } from '../event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../event/opened-tab-url-updated';
import { TabOpened } from '../event/tab-opened';
import { OpenedTab } from '../opened-tab';
import { OpenedTabBackend } from '../opened-tab-backend';
import { GetOpenedTabById } from '../query/get-opened-tab-by-id';
import { GetOpenedTabs } from '../query/get-opened-tabs';
import { NativeTabIdAssociationMaintainer } from './native-tab-id-association-maintainer';
import { OpenedTabCloser } from './opened-tab-closer';

export class NativeTabEventHandler implements OpenedTabBackend {
    private isInited = false;

    constructor(
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private nativeTabIdAssociationMaintainer: NativeTabIdAssociationMaintainer,
        private taskScheduler: TaskScheduler,
        private tabCloser: OpenedTabCloser,
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

    async getAll(): Promise<OpenedTab[]> {
        const rawTabs = await browser.tabs.query({});
        const tabList: OpenedTab[] = [];

        for (const rawTab of rawTabs) {
            const tab = await this.createTab(rawTab);

            if (null == tab) {
                continue;
            }

            tabList.push(tab);
        }

        return tabList;
    }

    private async createTab(nativeTab: browser.tabs.Tab): Promise<OpenedTab> {
        // incognito tabs are ignored for now
        if (null === nativeTab.id || null === nativeTab.index || nativeTab.incognito) {
            return;
        }

        const tabUrl = this.getTabUrlFromRawUrl(nativeTab.url);
        const openedTab = new OpenedTab();
        openedTab.id = await this.getTabIdFromNativeId(nativeTab.id);
        openedTab.position = nativeTab.index;
        openedTab.title = nativeTab.title;
        openedTab.url = tabUrl;
        openedTab.faviconUrl = nativeTab.favIconUrl;
        openedTab.isAudible = !!nativeTab.audible;
        openedTab.isAudioMuted = this.getMutedStateFromNativeMutedInfo(nativeTab.mutedInfo);
        openedTab.isDiscarded = !!nativeTab.discarded;
        openedTab.isFocused = !!nativeTab.active;
        openedTab.isLoading = 'loading' == nativeTab.status;
        openedTab.isPinned = !!nativeTab.pinned;
        openedTab.lastAccess = new Date(nativeTab.lastAccessed);

        return openedTab;
    }

    private async getTabIdFromNativeId(nativeTabId: number): Promise<string> {
        let tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(nativeTabId);

        if ('string' != typeof tabId || !await this.isTabIdAssociatedToNativeTabId(tabId, nativeTabId)) {
            tabId = uuid.v1();
            await this.nativeTabIdAssociationMaintainer.associateNativeTabId(tabId, nativeTabId);
        }

        return tabId;
    }

    private async isTabIdAssociatedToNativeTabId(tabId: string, nativeTabId: number) {
        // used to detect tab duplicates
        return nativeTabId === await this.nativeTabIdAssociationMaintainer.getAssociatedNativeTabId(tabId);
    }

    private getTabUrlFromRawUrl(rawUrl: string) {
        let url = rawUrl;

        if (0 == url.indexOf('about:reader?')) {
            url = new URL(url).searchParams.get('url');
            url = decodeURI(url);
        }

        return url;
    }

    private getMutedStateFromNativeMutedInfo(nativeMutedInfo: browser.tabs.MutedInfo) {
        return nativeMutedInfo ? !!nativeMutedInfo.muted : false;
    }

    async onNativeTabCreate(nativeTab: browser.tabs.Tab) {
        this.taskScheduler.add(async () => {
            const openedTab = await this.createTab(nativeTab);

            if (openedTab) {
                await this.eventBus.publish(new TabOpened(openedTab));
                await this.notifyTabMoveFromPosition(nativeTab.index + 1);
            }
        }).executeAll();
    }

    private async notifyTabMoveFromPosition(fromPosition: number) {
        const tabOpenStateList = await this.queryBus.query(new GetOpenedTabs());

        for (const tabOpenState of tabOpenStateList) {
            if (tabOpenState.position >= fromPosition) {
                await this.eventBus.publish(new OpenedTabMoved(tabOpenState.id, fromPosition));
            }
        }
    }

    private async onTabActivated(activatedInfo: browser.tabs.ActivatedInfo) {
        this.taskScheduler.add(async () => {
            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(activatedInfo.tabId);

            if (tabId) {
                await this.eventBus.publish(new OpenedTabFocused(tabId));
            }
        }).executeAll();
    }

    async onNativeTabClose(nativeTabId: number, removeInfo: browser.tabs.RemoveInfo) {
        this.taskScheduler.add(async () => {
            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(nativeTabId);

            if (null === tabId) {
                return;
            }

            const closedTab = await this.queryBus.query(new GetOpenedTabById(tabId));

            if (null == closedTab) {
                return;
            }

            await this.eventBus.publish(new OpenedTabClosed(closedTab));

            const closedTabPosition = closedTab ? closedTab.position : 0;
            await this.notifyTabMoveFromPosition(closedTabPosition);
        }).executeAll();
    }

    async onNativeTabMove(tabId: number, moveInfo: browser.tabs.MoveInfo) {
        this.taskScheduler.add(async () => {
            const minPosition = Math.min(moveInfo.fromIndex, moveInfo.toIndex);
            await this.notifyTabMoveFromPosition(minPosition);
        }).executeAll();
    }

    async onNativeTabUpdate(nativeTabId: number, updateInfo: browser.tabs.UpdateInfo) {
        this.taskScheduler.add(async () => {
            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(nativeTabId);

            if (null == tabId) {
                return;
            }

            if ('loading' == updateInfo.status) {
                await this.eventBus.publish(new OpenedTabIsLoading(tabId));
            } else if ('complete' == updateInfo.status) {
                await this.eventBus.publish(new OpenedTabLoadingIsComplete(tabId));
            }

            if (updateInfo.title) {
                await this.eventBus.publish(new OpenedTabTitleUpdated(tabId, updateInfo.title));
            }

            if (updateInfo.url) {
                const url = this.getTabUrlFromRawUrl(updateInfo.url);

                await this.eventBus.publish(new OpenedTabUrlUpdated(tabId, url));
            }

            if (undefined !== updateInfo.favIconUrl) {
                await this.eventBus.publish(new OpenedTabFaviconUrlUpdated(tabId, updateInfo.favIconUrl));
            }

            if (undefined !== updateInfo.pinned) {
                await this.eventBus.publish(new OpenedTabPinStateUpdated(tabId, updateInfo.pinned));
            }

            if (undefined !== updateInfo.audible) {
                await this.eventBus.publish(new OpenedTabAudibleStateUpdated(tabId, updateInfo.audible));
            }

            if (undefined !== updateInfo.discarded) {
                await this.eventBus.publish(new OpenedTabDiscardStateUpdated(tabId, updateInfo.discarded));
            }

            if (undefined !== updateInfo.mutedInfo) {
                const isAudioMuted = this.getMutedStateFromNativeMutedInfo(updateInfo.mutedInfo);
                await this.eventBus.publish(new OpenedTabAudioMuteStateUpdated(tabId, isAudioMuted));
            }
        }).executeAll();
    }
}
