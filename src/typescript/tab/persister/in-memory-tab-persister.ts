import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

export class InMemoryTabPersister implements TabPersister {
    private followStateMap = new Map<string, TabFollowState>();

    async getAll(): Promise<TabFollowState[]> {
        return Array.from(this.followStateMap.values());
    }

    async getByOpenIndex(index: number): Promise<TabFollowState> {
        // TODO optimize
        const followStateList = await this.getAll();

        for (const followState of followStateList) {
            if (followState.openIndex == index) {
                return this.getClonedFollowState(followState);
            }
        }

        return null;
    }

    async getByFollowId(followId: string): Promise<TabFollowState> {
        return this.followStateMap.get(followId);
    }

    private getClonedFollowState(followState: TabFollowState) {
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
        this.followStateMap.delete(followId);
    }
}
