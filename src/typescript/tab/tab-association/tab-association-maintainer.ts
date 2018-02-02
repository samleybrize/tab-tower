import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { OpenedTabAssociatedToFollowedTab } from '../event/opened-tab-associated-to-followed-tab';
import { TabClosed } from '../event/tab-closed';
import { TabUnfollowed } from '../event/tab-unfollowed';
import { TabFollowState } from '../followed-tab/tab-follow-state';
import { TabOpenState } from '../opened-tab/tab-open-state';
import { GetTabFollowStatesWithOpenLongLivedId } from '../query/get-tab-follow-states-with-open-long-lived-id';
import { GetTabOpenStates } from '../query/get-tab-open-states';

export class TabAssociationMaintainer {
    private openTabIdFollowIdAssociation = new Map<number, string>();
    private followIdOpenTabIdAssociation = new Map<string, number>();

    constructor(
        private eventBus: EventBus,
        private queryBus: QueryBus,
    ) {
    }

    async associateOpenedTabsWithFollowedTabs() {
        const tabOpenStateList = await this.queryBus.query(new GetTabOpenStates());
        const candidateFollowStates = await this.queryBus.query(new GetTabFollowStatesWithOpenLongLivedId());

        for (const tabOpenState of tabOpenStateList) {
            const followState = candidateFollowStates.get(tabOpenState.longLivedId);

            if (followState) {
                this.associateOpenedTabToFollowedTab(tabOpenState, followState);
            }
        }
    }

    associateOpenedTabToFollowedTab(openState: TabOpenState, followState: TabFollowState) {
        this.openTabIdFollowIdAssociation.set(openState.id, followState.id);
        this.followIdOpenTabIdAssociation.set(followState.id, openState.id);

        this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(openState, followState));
    }

    getAssociatedOpenedTabId(followId: string): number {
        return this.followIdOpenTabIdAssociation.get(followId);
    }

    getAssociatedFollowId(openTabId: number): string {
        return this.openTabIdFollowIdAssociation.get(openTabId);
    }

    async onTabUnfollow(event: TabUnfollowed) {
        if (null == event.openState) {
            return;
        }

        const followId = this.getAssociatedFollowId(event.openState.id);

        if (followId) {
            this.openTabIdFollowIdAssociation.delete(event.openState.id);
            this.followIdOpenTabIdAssociation.delete(followId);
        }
    }

    async onTabClose(event: TabClosed) {
        const followId = this.getAssociatedFollowId(event.closedTab.id);

        if (followId) {
            this.followIdOpenTabIdAssociation.delete(followId);
            this.openTabIdFollowIdAssociation.delete(event.closedTab.id);
        }
    }
}
