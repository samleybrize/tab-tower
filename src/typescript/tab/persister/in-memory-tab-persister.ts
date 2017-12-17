import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

// TODO decorator
export class InMemoryTabPersister implements TabPersister {
    private followStateMap = new Map<string, TabFollowState>();

    async getAll(): Promise<TabFollowState[]> {
        return Array.from(this.followStateMap.values());
    }

    async getByFollowId(followId: string): Promise<TabFollowState> {
        return this.getClonedFollowState(this.followStateMap.get(followId));
    }

    private getClonedFollowState(followState: TabFollowState) {
        if (null == followState) {
            return null;
        }

        const clonedFollowState = new TabFollowState();
        this.copyFollowState(followState, clonedFollowState);

        return clonedFollowState;
    }

    private copyFollowState(source: TabFollowState, destination: TabFollowState) {
        destination.faviconUrl = source.faviconUrl;
        destination.id = source.id;
        destination.isIncognito = source.isIncognito;
        destination.isInReaderMode = source.isInReaderMode;
        destination.openIndex = source.openIndex;
        destination.title = source.title;
        destination.url = source.url;
    }

    async persist(tabFollowState: TabFollowState) {
        const existingTabFollowState = this.followStateMap.get(tabFollowState.id);

        if (existingTabFollowState) {
            const oldOpenIndex = existingTabFollowState.openIndex;
            this.copyFollowState(tabFollowState, existingTabFollowState);
        } else {
            const clonedFollowState = this.getClonedFollowState(tabFollowState);

            this.followStateMap.set(clonedFollowState.id, clonedFollowState);
        }
    }

    async setOpenIndex(followId: string, openIndex: number) {
        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.openIndex = openIndex;
        }
    }

    async setFaviconUrl(followId: string, faviconUrl: string) {
        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.faviconUrl = faviconUrl;
        }
    }

    async setTitle(followId: string, title: string) {
        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.title = title;
        }
    }

    async setUrl(followId: string, url: string) {
        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.url = url;
        }
    }

    async setReaderMode(followId: string, readerMode: boolean) {
        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.isInReaderMode = readerMode;
        }
    }

    async remove(followId: string): Promise<void> {
        const followStateToRemove = this.followStateMap.get(followId);

        if (followStateToRemove) {
            this.followStateMap.delete(followId);
        }
    }
}
