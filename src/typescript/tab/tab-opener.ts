import { EventBus } from '../bus/event-bus';
import { sleep } from '../utils/sleep';
import { RestoreFollowedTab } from './command/restore-followed-tab';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { FollowedTabRetriever } from './followed-tab/followed-tab-retriever';
import { TabFollowState } from './followed-tab/tab-follow-state';
import { NativeRecentlyClosedTabAssociationMaintainer } from './native-recently-closed-tab/native-recently-closed-tab-association-maintainer';
import { OpenedTabRetriever } from './opened-tab/opened-tab-retriever';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class TabOpener {
    constructor(
        private openedTabRetriever: OpenedTabRetriever,
        private followedTabRetriever: FollowedTabRetriever,
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private nativeRecentlyClosedTabAssociationMaintainer: NativeRecentlyClosedTabAssociationMaintainer,
        private eventBus: EventBus,
    ) {
    }

    async restoreFollowedTab(command: RestoreFollowedTab) {
        const followState = await this.followedTabRetriever.getById(command.followId);
        let openedTab: browser.tabs.Tab = await this.restoreFromRecentlyClosedTabs(followState);

        if (null == openedTab) {
            openedTab = await this.restoreFromNewTab(followState);
        }

        await this.waitForNewTabLoad(openedTab.id);
        this.associateNewTabToFollowedTab(command, openedTab);
    }

    private async restoreFromRecentlyClosedTabs(followState: TabFollowState) {
        const sessionId = this.nativeRecentlyClosedTabAssociationMaintainer.getSessionIdAssociatedToOpenLongLivedId(followState.openLongLivedId);

        if (null != sessionId) {
            const targetIndex = (await browser.tabs.query({})).length;
            const activeTab = (await browser.tabs.query({active: true})).shift();
            const session = await browser.sessions.restore(sessionId);

            await browser.tabs.update(activeTab.id, {active: true});
            await browser.tabs.move(session.tab.id, {index: targetIndex});

            return session.tab;
        }

        return null;
    }

    private async restoreFromNewTab(followState: TabFollowState) {
        const createTabOptions: browser.tabs.CreateProperties = {
            active: false,
            url: followState.url,
        };

        if (browser.tabs.toggleReaderMode) {
            createTabOptions.openInReaderMode = followState.isInReaderMode;
        }

        return await browser.tabs.create(createTabOptions);
    }

    private async associateNewTabToFollowedTab(openTabCommand: RestoreFollowedTab, openedTab: browser.tabs.Tab) {
        const tabFollowState = await this.followedTabRetriever.getById(openTabCommand.followId);
        const tabOpenState = await this.openedTabRetriever.getById(openedTab.id);

        this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(tabOpenState, tabFollowState);
        this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(tabOpenState, tabFollowState));
    }

    async waitForNewTabLoad(tabId: number) {
        const maxRetries = 300;

        for (let i = 0; i < maxRetries; i++) {
            await sleep(100);
            const openedTab = await browser.tabs.get(tabId);

            if ('complete' == openedTab.status && 'about:blank' != openedTab.url) {
                break;
            }
        }
    }
}
