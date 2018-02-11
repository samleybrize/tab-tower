import * as uuid from 'uuid';

import { TabClosed } from '../event/tab-closed';
import { TabOpened } from '../event/tab-opened';
import { PrivilegedUrlDetector } from '../privileged-url-detector';
import { GetTabOpenStateByOpenId } from '../query/get-tab-open-state-by-open-id';
import { GetTabOpenStates } from '../query/get-tab-open-states';
import { TabOpenState } from './tab-open-state';

export class OpenedTabRetriever {
    private longLivedIdMap = new Map<string, number>();

    constructor(private privilegedUrlDetector: PrivilegedUrlDetector, private ignoreUrlsThatStartWith: string[]) {
    }

    async init() {
        const tabList = await this.getAll();

        for (const tab of tabList) {
            this.longLivedIdMap.set(tab.longLivedId, tab.id);
        }
    }

    async onTabOpen(event: TabOpened) {
        this.longLivedIdMap.set(event.tabOpenState.longLivedId, event.tabOpenState.id);
    }

    async onTabClose(event: TabClosed) {
        this.longLivedIdMap.delete(event.closedTab.longLivedId);
    }

    async queryAll(query: GetTabOpenStates): Promise<TabOpenState[]> {
        return this.getAll();
    }

    private async getAll(): Promise<TabOpenState[]> {
        const rawTabs = await browser.tabs.query({});
        const tabList: TabOpenState[] = [];

        for (const rawTab of rawTabs) {
            const tab = await this.createTab(rawTab);

            if (null == tab) {
                continue;
            }

            tabList.push(tab);
        }

        return tabList;
    }

    private async createTab(rawTab: browser.tabs.Tab): Promise<TabOpenState> {
        // incognito tabs are ignored for now
        if (null === rawTab.id || null === rawTab.index || rawTab.incognito) {
            return;
        }

        const {url, isInReaderMode} = this.getUrlAndReaderModeState(rawTab);
        const tabOpenState = new TabOpenState();
        tabOpenState.id = rawTab.id;
        tabOpenState.longLivedId = await this.getTabLongLivedId(rawTab.id, false);
        tabOpenState.index = rawTab.index;
        tabOpenState.title = rawTab.title;
        tabOpenState.isIncognito = !!rawTab.incognito;
        tabOpenState.isInReaderMode = isInReaderMode;
        tabOpenState.isPinned = !!rawTab.pinned;
        tabOpenState.isAudible = !!rawTab.audible;
        tabOpenState.isAudioMuted = rawTab.mutedInfo ? !!rawTab.mutedInfo.muted : false;
        tabOpenState.url = url;
        tabOpenState.faviconUrl = rawTab.favIconUrl;
        tabOpenState.isPrivileged = this.privilegedUrlDetector.isPrivileged(url, isInReaderMode);
        tabOpenState.isIgnored = this.isUrlIgnored(rawTab.url);
        tabOpenState.lastAccess = new Date(rawTab.lastAccessed);

        await this.assignNewLongLivedIdIfTabIsDuplicate(tabOpenState);

        return tabOpenState;
    }

    private async assignNewLongLivedIdIfTabIsDuplicate(tabOpenState: TabOpenState) {
        const tabIdCorrespondingToLongLivedId = this.longLivedIdMap.get(tabOpenState.longLivedId);

        if (tabIdCorrespondingToLongLivedId && tabOpenState.id != tabIdCorrespondingToLongLivedId) {
            tabOpenState.longLivedId = await this.getTabLongLivedId(tabOpenState.id, true);
        }
    }

    private isUrlIgnored(url: string) {
        for (const startToIgnore of this.ignoreUrlsThatStartWith) {
            if (0 == url.indexOf(startToIgnore)) {
                return true;
            }
        }

        return false;
    }

    private getUrlAndReaderModeState(rawTab: browser.tabs.Tab) {
        let url = rawTab.url;
        let isInReaderMode = false;

        if (0 == url.indexOf('about:reader?')) {
            url = new URL(url).searchParams.get('url');
            url = decodeURI(url);
            isInReaderMode = true;
        }

        return {url, isInReaderMode};
    }

    private async getTabLongLivedId(tabId: number, alwaysRegenerate: boolean): Promise<string> {
        let longLivedId = await browser.sessions.getTabValue(tabId, 'longLivedId');

        if (alwaysRegenerate || 'string' != typeof longLivedId) {
            longLivedId = uuid.v1();
            await browser.sessions.setTabValue(tabId, 'longLivedId', longLivedId);
        }

        return longLivedId;
    }

    async queryById(query: GetTabOpenStateByOpenId): Promise<TabOpenState> {
        let rawTab: browser.tabs.Tab;

        try {
            // a not found id throws an error
            rawTab = await browser.tabs.get(query.openId);
        } catch (error) {
            return null;
        }

        return await this.createTab(rawTab);
    }
}
