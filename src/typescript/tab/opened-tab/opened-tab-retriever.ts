import * as uuid from 'uuid';

import { TaskScheduler } from '../../utils/task-scheduler';
import { OpenedTabAudibleStateUpdated } from './event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from './event/opened-tab-audio-mute-state-updated';
import { OpenedTabClosed } from './event/opened-tab-closed';
import { OpenedTabDiscardStateUpdated } from './event/opened-tab-discard-state-updated';
import { OpenedTabFaviconUrlUpdated } from './event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './event/opened-tab-focused';
import { OpenedTabIsLoading } from './event/opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from './event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from './event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from './event/opened-tab-pin-state-updated';
import { OpenedTabTitleUpdated } from './event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './event/opened-tab-url-updated';
import { TabOpened } from './event/tab-opened';
import { OpenedTab } from './opened-tab';
import { OpenedTabBackend } from './opened-tab-backend';
import { GetOpenedTabById } from './query/get-opened-tab-by-id';
import { GetOpenedTabs } from './query/get-opened-tabs';

// TODO multi window
export class OpenedTabRetriever {
    private tabMap = new Map<string, OpenedTab>();
    private tabList: OpenedTab[] = null;
    private focusedTab: OpenedTab = null;

    constructor(private openedTabBackend: OpenedTabBackend, private taskScheduler: TaskScheduler) {
    }

    async init() {
        if (null !== this.tabList) {
            return;
        }

        const tabList = await this.openedTabBackend.getAll();

        for (const tab of tabList) {
            this.tabMap.set(tab.id, tab);

            if (tab.isFocused) {
                this.focusedTab = tab;
            }
        }

        this.tabList = tabList;
    }

    async queryAll(query: GetOpenedTabs): Promise<OpenedTab[]> {
        return this.tabList;
    }

    async queryById(query: GetOpenedTabById): Promise<OpenedTab> {
        return this.getById(query.tabId);
    }

    private async getById(tabId: string) {
        return this.tabMap.get(tabId);
    }

    async onTabOpen(event: TabOpened) {
        await this.taskScheduler.add(async () => {
            const tabToInsert = event.tab;
            this.tabMap.set(tabToInsert.id, tabToInsert);
            this.insertTabOnTabList(tabToInsert);
        }).executeAll();
    }

    private insertTabOnTabList(tabToInsert: OpenedTab) {
        const insertAt = this.tabList.findIndex((tab) => tab.position > tabToInsert.position);

        if (insertAt >= 0) {
            this.tabList.splice(insertAt, 0, tabToInsert);
        } else {
            this.tabList.push(tabToInsert);
        }
    }

    async onTabClose(event: OpenedTabClosed) {
        await this.taskScheduler.add(async () => {
            const closedTabId = event.closedTab.id;
            const closedTab = this.tabMap.get(closedTabId);

            if (null === closedTab) {
                return;
            }

            this.tabMap.delete(closedTabId);
            this.removeTabFromTabList(closedTab);
        }).executeAll();
    }

    private removeTabFromTabList(tab: OpenedTab) {
        const index = this.tabList.indexOf(tab);
        this.tabList.splice(index, 1);
    }

    async onTabLoading(event: OpenedTabIsLoading) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.isLoading = true;
            }
        }).executeAll();
    }

    async onTabLoadingComplete(event: OpenedTabLoadingIsComplete) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.isLoading = false;
            }
        }).executeAll();
    }

    async onTabAudibleStateUpdate(event: OpenedTabAudibleStateUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.isAudible = event.isAudible;
            }
        }).executeAll();
    }

    async onTabAudioMuteStateUpdate(event: OpenedTabAudioMuteStateUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.isAudioMuted = event.isAudioMuted;
            }
        }).executeAll();
    }

    async onTabDiscardStateUpdate(event: OpenedTabDiscardStateUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.isDiscarded = event.isDiscarded;
            }
        }).executeAll();
    }

    async onTabFaviconUrlUpdate(event: OpenedTabFaviconUrlUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.faviconUrl = event.faviconUrl;
            }
        }).executeAll();
    }

    async onTabFocus(event: OpenedTabFocused) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                if (this.focusedTab) {
                    this.focusedTab.isFocused = false;
                }

                tab.isFocused = true;
                tab.lastAccess = new Date();
            }
        }).executeAll();
    }

    async onTabMove(event: OpenedTabMoved) {
        await this.taskScheduler.add(async () => {
            const movedTab = this.tabMap.get(event.tabId);

            if (null === movedTab) {
                return;
            }

            movedTab.position = event.position;
            this.removeTabFromTabList(movedTab);
            this.insertTabOnTabList(movedTab);
        }).executeAll();
    }

    async onTabPinStateUpdate(event: OpenedTabPinStateUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.isPinned = event.isPinned;
            }
        }).executeAll();
    }

    async onTabTitleUpdate(event: OpenedTabTitleUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.title = event.title;
            }
        }).executeAll();
    }

    async onTabUrlUpdate(event: OpenedTabUrlUpdated) {
        await this.taskScheduler.add(async () => {
            const tab = this.tabMap.get(event.tabId);

            if (tab) {
                tab.url = event.url;
            }
        }).executeAll();
    }
}
