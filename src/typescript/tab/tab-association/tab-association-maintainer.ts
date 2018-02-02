import { EventBus } from '../../bus/event-bus';
import { OpenedTabAssociatedToFollowedTab } from '../event/opened-tab-associated-to-followed-tab';
import { TabClosed } from '../event/tab-closed';
import { TabUnfollowed } from '../event/tab-unfollowed';
import { FollowedTabRetriever } from '../followed-tab/followed-tab-retriever';
import { TabFollowState } from '../followed-tab/tab-follow-state';
import { OpenedTabRetriever } from '../opened-tab/opened-tab-retriever';
import { TabOpenState } from '../opened-tab/tab-open-state';

export class TabAssociationMaintainer {
    private openTabIdFollowIdAssociation = new Map<number, string>();
    private followIdOpenTabIdAssociation = new Map<string, number>();

    constructor(
        private followedTabRetriever: FollowedTabRetriever,
        private openedTabRetriever: OpenedTabRetriever,
        private eventBus: EventBus,
    ) {
    }

    async associateOpenedTabsWithFollowedTabs() {
        const tabOpenStateList = await this.openedTabRetriever.getAll();
        const candidateFollowStates = await this.followedTabRetriever.getWithOpenLongLivedId();

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
