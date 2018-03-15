import { QueryBus } from '../bus/query-bus';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { GetFollowIdAssociatedToOpenId } from '../tab/query/get-follow-id-associated-to-open-id';

export class BrowserActionBadge {
    constructor(private queryBus: QueryBus) {
    }

    async onAssociateOpenedTabToFollowedTab(event: OpenedTabAssociatedToFollowedTab) {
        this.markOpenedTabAsFollowed(event.tabOpenState.id);
    }

    private markOpenedTabAsFollowed(tabId: number) {
        browser.browserAction.setBadgeText({text: 'F', tabId});
        browser.browserAction.setBadgeBackgroundColor({color: 'green', tabId});
    }

    async onOpenedTabUrlUpdate(event: OpenedTabUrlUpdated) {
        const associatedFollowId = await this.queryBus.query(new GetFollowIdAssociatedToOpenId(event.tabOpenState.id));

        if ('string' !== typeof associatedFollowId) {
            this.markOpenedTabAsNotFollowed(event.tabOpenState.id);
        } else {
            this.markOpenedTabAsFollowed(event.tabOpenState.id);
        }
    }

    async onTabUnfollow(event: TabUnfollowed) {
        this.markOpenedTabAsNotFollowed(event.openState.id);
    }

    private markOpenedTabAsNotFollowed(tabId: number) {
        browser.browserAction.setBadgeText({text: '', tabId});
    }
}
