import { TabClosed } from './event/tab-closed';
import { TabUnfollowed } from './event/tab-unfollowed';

export class TabAssociationMaintainer {
    private openTabIdFollowIdAssociation = new Map<number, string>();
    private followIdOpenTabIdAssociation = new Map<string, number>();

    associateOpenedTabToFollowedTab(openTabId: number, followId: string) {
        this.openTabIdFollowIdAssociation.set(openTabId, followId);
        this.followIdOpenTabIdAssociation.set(followId, openTabId);
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
        const followId = this.getAssociatedFollowId(event.tabId);

        if (followId) {
            this.followIdOpenTabIdAssociation.delete(followId);
            this.openTabIdFollowIdAssociation.delete(event.tabId);
        }
    }
}
