import { CommandBus } from '../../bus/command-bus';
import { QueryBus } from '../../bus/query-bus';
import { sleep } from '../../utils/sleep';
import { GetSessionIdAssociatedToOpenLongLivedId } from '../native-recently-closed-tab/query/get-session-id-associated-to-open-long-lived-id';
import { OpenedTabWaiter } from '../opened-tab/opened-tab-waiter';
import { GetTabOpenStateByOpenId } from '../opened-tab/query/get-tab-open-state-by-open-id';
import { AssociateOpenedTabToFollowedTab } from '../tab-association/command/associate-opened-tab-to-followed-tab';
import { GetOpenIdAssociatedToFollowId } from '../tab-association/query/get-open-id-associated-to-follow-id';
import { RestoreFollowedTab, TabOpenTarget } from './command/restore-followed-tab';
import { GetTabFollowStateByFollowId } from './query/get-tab-follow-state-by-follow-id';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabOpener {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private openedTabWaiter: OpenedTabWaiter,
    ) {
    }

    async restoreFollowedTab(command: RestoreFollowedTab) {
        const isRestoredTabMustBeFocused = this.isRestoredTabMustBeFocused(command.target);
        const associatedOpenId = await this.queryBus.query(new GetOpenIdAssociatedToFollowId(command.followId));

        if (associatedOpenId) {
            if (isRestoredTabMustBeFocused) {
                await browser.tabs.update(associatedOpenId, {active: true});
            }

            return;
        }

        const followState = await this.queryBus.query(new GetTabFollowStateByFollowId(command.followId));
        let openedTab: browser.tabs.Tab = await this.restoreFromRecentlyClosedTabs(followState, isRestoredTabMustBeFocused);

        if (null == openedTab) {
            openedTab = await this.restoreFromNewTab(followState, isRestoredTabMustBeFocused);
        }

        await this.openedTabWaiter.waitForNewTabLoad(openedTab.id);
        this.associateNewTabToFollowedTab(command, openedTab);
    }

    private isRestoredTabMustBeFocused(openTarget: TabOpenTarget) {
        if (TabOpenTarget.CurrentTab == openTarget || TabOpenTarget.NewForegroundTab == openTarget) {
            return true;
        }

        return false;
    }

    private async restoreFromRecentlyClosedTabs(followState: TabFollowState, isRestoredTabMustBeFocused: boolean) {
        const sessionId = await this.queryBus.query(new GetSessionIdAssociatedToOpenLongLivedId(followState.openLongLivedId));

        if (null != sessionId) {
            const targetIndex = (await browser.tabs.query({})).length;
            const activeTab = (await browser.tabs.query({active: true})).shift();
            const session = await browser.sessions.restore(sessionId);

            if (session.tab.pinned) {
                await browser.tabs.update(session.tab.id, {pinned: false});
            }

            if (!isRestoredTabMustBeFocused) {
                await browser.tabs.update(activeTab.id, {active: true});
            }

            await browser.tabs.move(session.tab.id, {index: targetIndex});

            return session.tab;
        }

        return null;
    }

    private async restoreFromNewTab(followState: TabFollowState, isRestoredTabMustBeFocused: boolean) {
        const createTabOptions: browser.tabs.CreateProperties = {
            active: isRestoredTabMustBeFocused,
            url: followState.url,
        };

        if (browser.tabs.toggleReaderMode) {
            createTabOptions.openInReaderMode = followState.isInReaderMode;
        }

        const tab = await browser.tabs.create(createTabOptions);

        if (followState.isAudioMuted) {
            await browser.tabs.update(tab.id, {muted: true});
            tab.mutedInfo = {
                muted: true,
                reason: null,
            };
        }

        return tab;
    }

    private async associateNewTabToFollowedTab(restoreTabCommand: RestoreFollowedTab, openedTab: browser.tabs.Tab) {
        const tabFollowState = await this.queryBus.query(new GetTabFollowStateByFollowId(restoreTabCommand.followId));
        const tabOpenState = await this.queryBus.query(new GetTabOpenStateByOpenId(openedTab.id));

        await this.commandBus.handle(new AssociateOpenedTabToFollowedTab(tabOpenState, tabFollowState));
    }
}
