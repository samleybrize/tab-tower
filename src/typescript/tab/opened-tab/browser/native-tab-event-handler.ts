import * as uuid from 'uuid';

import { EventBus } from '../../../bus/event-bus';
import { QueryBus } from '../../../bus/query-bus';
import { Logger } from '../../../logger/logger';
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
import { OpenedTabPositionUpdated } from '../event/opened-tab-position-updated';
import { OpenedTabTitleUpdated } from '../event/opened-tab-title-updated';
import { OpenedTabUnfocused } from '../event/opened-tab-unfocused';
import { OpenedTabUrlUpdated } from '../event/opened-tab-url-updated';
import { TabOpened } from '../event/tab-opened';
import { OpenedTab } from '../opened-tab';
import { OpenedTabBackend } from '../opened-tab-backend';
import { GetOpenedTabById } from '../query/get-opened-tab-by-id';
import { NativeTabIdAssociationMaintainer } from './native-tab-id-association-maintainer';

export class NativeTabEventHandler implements OpenedTabBackend {
    private isInited = false;
    private focusedTabMap = new Map<number, string>();

    constructor(
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private nativeTabIdAssociationMaintainer: NativeTabIdAssociationMaintainer,
        private taskScheduler: TaskScheduler,
        private logger: Logger,
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
        const nativeTabList = await browser.tabs.query({});
        const tabList: OpenedTab[] = [];

        for (const nativeTab of nativeTabList) {
            const tab = await this.createTab(nativeTab);

            if (null == tab) {
                continue;
            } else if (tab.isFocused) {
                this.focusedTabMap.set(nativeTab.windowId, tab.id);
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
            this.logger.debug({message: `Received a "created" browser tab event for tab "${nativeTab.id}"`, context: nativeTab});
            const openedTab = await this.createTab(nativeTab);

            if (openedTab) {
                this.nativeTabIdAssociationMaintainer.onNativeTabOpen(nativeTab.id);
                await this.eventBus.publish(new TabOpened(openedTab));
                await this.notifyTabsPositionsUpdate(openedTab.position + 1);

                if (openedTab.isFocused) {
                    await this.notifyTabFocused(openedTab.id, nativeTab.windowId);
                }
            }
        }).executeAll();
    }

    private async notifyTabFocused(focusedTabId: string, focusedTabNativeWindowId: number) {
        await this.eventBus.publish(new OpenedTabFocused(focusedTabId));
        const previousFocusedTabId = this.focusedTabMap.get(focusedTabNativeWindowId);

        if (previousFocusedTabId && previousFocusedTabId !== focusedTabId) {
            await this.eventBus.publish(new OpenedTabUnfocused(previousFocusedTabId));
        }

        this.focusedTabMap.set(focusedTabNativeWindowId, focusedTabId);
    }

    private async notifyTabsPositionsUpdate(fromPosition?: number) {
        const rawTabList = await browser.tabs.query({});
        fromPosition = fromPosition > 0 ? fromPosition : 0;

        for (const rawTab of rawTabList) {
            if (rawTab.index < fromPosition) {
                continue;
            }

            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(rawTab.id);
            await this.eventBus.publish(new OpenedTabPositionUpdated(tabId, rawTab.index));
        }
    }

    private async onTabActivated(activatedInfo: browser.tabs.ActivatedInfo) {
        this.taskScheduler.add(async () => {
            this.logger.debug({message: `Received an "activated" browser tab event for tab "${activatedInfo.tabId}"`, context: activatedInfo});
            const nativeTabId = activatedInfo.tabId;
            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(nativeTabId);

            if (null == tabId) {
                return;
            }

            await this.notifyTabFocused(tabId, activatedInfo.windowId);
        }).executeAll();
    }

    async onNativeTabClose(nativeTabId: number, removeInfo: browser.tabs.RemoveInfo) {
        this.taskScheduler.add(async () => {
            this.logger.debug({message: `Received a "closed" browser tab event for tab "${nativeTabId}"`, context: removeInfo});
            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(nativeTabId);

            if (null === tabId) {
                return;
            }

            const closedTab = await this.queryBus.query(new GetOpenedTabById(tabId));

            if (null == closedTab) {
                return;
            }

            await this.eventBus.publish(new OpenedTabClosed(closedTab));
            this.nativeTabIdAssociationMaintainer.onNativeTabClose(nativeTabId);

            await this.notifyFocusedTabUpdated(removeInfo.windowId);
            await this.notifyTabsPositionsUpdate(closedTab.position);
        }).executeAll();
    }

    private async notifyFocusedTabUpdated(nativeWindowId: number) {
        const focusedTabs = await browser.tabs.query({active: true, windowId: nativeWindowId});

        if (focusedTabs) {
            const focusedTabId = await this.getTabIdFromNativeId(focusedTabs[0].id);
            await this.notifyTabFocused(focusedTabId, nativeWindowId);
        }
    }

    async onNativeTabMove(nativeTabId: number, moveInfo: browser.tabs.MoveInfo) {
        this.taskScheduler.add(async () => {
            this.logger.debug({message: `Received a "move" browser tab event for tab "${nativeTabId}"`, context: moveInfo});
            const tabId = await this.nativeTabIdAssociationMaintainer.getAssociatedOpenedTabId(nativeTabId);

            if (null == tabId) {
                return;
            }

            const movedTab = await this.queryBus.query(new GetOpenedTabById(tabId));

            if (null == movedTab) {
                return;
            }

            const lowestPosition = Math.min(movedTab.position, moveInfo.toIndex);
            await this.notifyTabsPositionsUpdate(lowestPosition);
            await this.eventBus.publish(new OpenedTabMoved(tabId, moveInfo.toIndex));
        }).executeAll();
    }

    async onNativeTabUpdate(nativeTabId: number, updateInfo: browser.tabs.UpdateInfo) {
        this.taskScheduler.add(async () => {
            this.logger.debug({message: `Received an "update" browser tab event for tab "${nativeTabId}"`, context: updateInfo});
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
