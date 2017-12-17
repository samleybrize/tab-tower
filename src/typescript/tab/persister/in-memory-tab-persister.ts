import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

export class InMemoryTabPersister implements TabPersister {
    private followStateMap = new Map<string, TabFollowState>();
    private isRetrievedFromDecorated = false;

    constructor(private decoratedTabPersister?: TabPersister) {
    }

    async getAll(): Promise<TabFollowState[]> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        return Array.from(this.followStateMap.values());
    }

    private async retrieveFromDecorated() {
        if (this.isRetrievedFromDecorated) {
            return;
        }

        const followStateList = await this.decoratedTabPersister.getAll();

        for (const followState of followStateList) {
            this.followStateMap.set(followState.id, followState);
        }

        this.isRetrievedFromDecorated = true;
    }

    async getByFollowId(followId: string): Promise<TabFollowState> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

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
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(tabFollowState.id);

        if (existingTabFollowState) {
            this.copyFollowState(tabFollowState, existingTabFollowState);
        } else {
            const clonedFollowState = this.getClonedFollowState(tabFollowState);

            this.followStateMap.set(clonedFollowState.id, clonedFollowState);
        }
    }

    async setOpenIndex(followId: string, openIndex: number) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.openIndex = openIndex;
        }
    }

    async setFaviconUrl(followId: string, faviconUrl: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.faviconUrl = faviconUrl;
        }
    }

    async setTitle(followId: string, title: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.title = title;
        }
    }

    async setUrl(followId: string, url: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.url = url;
        }
    }

    async setReaderMode(followId: string, readerMode: boolean) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (existingTabFollowState) {
            existingTabFollowState.isInReaderMode = readerMode;
        }
    }

    async remove(followId: string): Promise<void> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const followStateToRemove = this.followStateMap.get(followId);

        if (followStateToRemove) {
            this.followStateMap.delete(followId);
        }
    }
}
