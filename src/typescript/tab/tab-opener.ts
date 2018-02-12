import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { sleep } from '../utils/sleep';
import { AssociateOpenedTabToFollowedTab } from './command/associate-opened-tab-to-followed-tab';
import { RestoreFollowedTab } from './command/restore-followed-tab';
import { TabFollowState } from './followed-tab/tab-follow-state';
import { GetSessionIdAssociatedToOpenLongLivedId } from './query/get-session-id-associated-to-open-long-lived-id';
import { GetTabFollowStateByFollowId } from './query/get-tab-follow-state-by-follow-id';
import { GetTabOpenStateByOpenId } from './query/get-tab-open-state-by-open-id';

export class TabOpener {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {
    }

    async restoreFollowedTab(command: RestoreFollowedTab) {
        const followState = await this.queryBus.query(new GetTabFollowStateByFollowId(command.followId));
        let openedTab: browser.tabs.Tab = await this.restoreFromRecentlyClosedTabs(followState);

        if (null == openedTab) {
            openedTab = await this.restoreFromNewTab(followState);
        }

        await this.waitForNewTabLoad(openedTab.id);
        this.associateNewTabToFollowedTab(command, openedTab);
    }

    private async restoreFromRecentlyClosedTabs(followState: TabFollowState) {
        const sessionId = await this.queryBus.query(new GetSessionIdAssociatedToOpenLongLivedId(followState.openLongLivedId));

        if (null != sessionId) {
            const targetIndex = (await browser.tabs.query({})).length;
            const activeTab = (await browser.tabs.query({active: true})).shift();
            const session = await browser.sessions.restore(sessionId);

            if (session.tab.pinned) {
                await browser.tabs.update(session.tab.id, {pinned: false});
            }

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

    private async associateNewTabToFollowedTab(restoreTabCommand: RestoreFollowedTab, openedTab: browser.tabs.Tab) {
        const tabFollowState = await this.queryBus.query(new GetTabFollowStateByFollowId(restoreTabCommand.followId));
        const tabOpenState = await this.queryBus.query(new GetTabOpenStateByOpenId(openedTab.id));

        await this.commandBus.handle(new AssociateOpenedTabToFollowedTab(tabOpenState, tabFollowState));
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
