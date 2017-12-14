import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

export class InMemoryTabPersister implements TabPersister {
    private followStateMap = new Map<string, TabFollowState>();
    private followStateByOpenIndexMap = new Map<number, TabFollowState>();

    async getAll(): Promise<TabFollowState[]> {
        return Array.from(this.followStateMap.values());
    }

    async getByOpenIndex(index: number): Promise<TabFollowState> {
        return this.getClonedFollowState(this.followStateByOpenIndexMap.get(index));
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
            this.updateOpenIndexMap(existingTabFollowState, oldOpenIndex);
        } else {
            const clonedFollowState = this.getClonedFollowState(tabFollowState);

            this.followStateMap.set(clonedFollowState.id, clonedFollowState);
            this.updateOpenIndexMap(tabFollowState);
        }

    }

    private updateOpenIndexMap(followState: TabFollowState, oldOpenIndex?: number) {
        if (null !== followState.openIndex) {
            this.addFollowStateToOpenIndexMap(followState, oldOpenIndex);
        } else if (null !== oldOpenIndex) {
            this.followStateByOpenIndexMap.delete(oldOpenIndex);
        }
    }

    private addFollowStateToOpenIndexMap(followState: TabFollowState, oldOpenIndex: number) {
        if (followState.openIndex == oldOpenIndex) {
            return;
        }

        const followStateAtIndex = this.followStateByOpenIndexMap.get(followState.openIndex);

        if (followStateAtIndex && followStateAtIndex.id == followState.id) {
            return;
        } else if (oldOpenIndex) {
            this.removeOldOpenIndexFromOpenIndexMap(followState, oldOpenIndex);
        }

        this.followStateByOpenIndexMap.set(followState.openIndex, this.getClonedFollowState(followState));
    }

    private removeOldOpenIndexFromOpenIndexMap(followState: TabFollowState, oldOpenIndex: number) {
        const followStateAtOldIndex = this.followStateByOpenIndexMap.get(oldOpenIndex);

        if (followStateAtOldIndex.id == followState.id) {
            this.followStateByOpenIndexMap.delete(followState.openIndex);
        }
    }

    async setOpenIndex(followId: string, openIndex: number) {
        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            const oldOpenIndex = existingTabFollowState.openIndex;
            existingTabFollowState.openIndex = openIndex;
            this.updateOpenIndexMap(existingTabFollowState, oldOpenIndex);
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
            this.removeFromOpenIndexMap(followStateToRemove);
        }
    }

    private removeFromOpenIndexMap(followState: TabFollowState) {
        if (null !== followState.openIndex) {
            this.followStateByOpenIndexMap.delete(followState.openIndex);
        }
    }
}
