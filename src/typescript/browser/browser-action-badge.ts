import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';

export class BrowserActionBadge {
    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        this.markOpenedTabAsFollowed(event.tabOpenState.id);
    }

    private markOpenedTabAsFollowed(tabId: number) {
        browser.browserAction.setBadgeText({text: 'F', tabId});
        browser.browserAction.setBadgeBackgroundColor({color: 'green', tabId});
    }

    async onTabUnfollow(event: TabUnfollowed) {
        this.markOpenedTabAsNotFollowed(event.openState.id);
    }

    private markOpenedTabAsNotFollowed(tabId: number) {
        browser.browserAction.setBadgeText({text: '', tabId});
    }
}
