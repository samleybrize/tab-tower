import { TabFollowState } from '../tab-follow-state';
import { FollowStatePersister } from './follow-state-persister';

export class InMemoryFollowStatePersister implements FollowStatePersister {
    private followStateMap = new Map<string, TabFollowState>();
    private longLivedIdAssociationMap = new Map<string, string>();
    private weightMap = new Map<string, number>();
    private isRetrievedFromDecorated = false;

    constructor(private decoratedTabPersister?: FollowStatePersister) {
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
            this.weightMap.set(followState.id, followState.weight);
            this.updateLongLivedIdAssociationMap(followState.id, null, followState.openLongLivedId);
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

    async getByOpenLongLivedId(openLongLivedId: string): Promise<TabFollowState> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        } else if (!this.longLivedIdAssociationMap.has(openLongLivedId)) {
            return null;
        }

        const followId = this.longLivedIdAssociationMap.get(openLongLivedId);
        return this.getClonedFollowState(this.followStateMap.get(followId));
    }

    private copyFollowState(source: TabFollowState, destination: TabFollowState) {
        destination.faviconUrl = source.faviconUrl;
        destination.id = source.id;
        destination.weight = source.weight;
        destination.isIncognito = source.isIncognito;
        destination.isInReaderMode = source.isInReaderMode;
        destination.isAudioMuted = source.isAudioMuted;
        destination.openLongLivedId = source.openLongLivedId;
        destination.openLastAccess = source.openLastAccess;
        destination.title = source.title;
        destination.url = source.url;
    }

    async getWeightList(): Promise<number[]> {
        return Array.from(this.weightMap.values());
    }

    async persist(tabFollowState: TabFollowState) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(tabFollowState.id);

        if (existingTabFollowState) {
            this.updateLongLivedIdAssociationMap(tabFollowState.id, existingTabFollowState.openLongLivedId, tabFollowState.openLongLivedId);
            this.copyFollowState(tabFollowState, existingTabFollowState);
        } else {
            const clonedFollowState = this.getClonedFollowState(tabFollowState);

            this.updateLongLivedIdAssociationMap(tabFollowState.id, null, tabFollowState.openLongLivedId);
            this.followStateMap.set(clonedFollowState.id, clonedFollowState);
            this.weightMap.set(clonedFollowState.id, clonedFollowState.weight);
        }

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.persist(tabFollowState);
        }
    }

    private updateLongLivedIdAssociationMap(followId: string, oldOpenLongLivedId: string, newOpenLongLivedId: string) {
        if (null != oldOpenLongLivedId) {
            this.longLivedIdAssociationMap.delete(oldOpenLongLivedId);
        }

        if (null != newOpenLongLivedId) {
            this.longLivedIdAssociationMap.set(newOpenLongLivedId, followId);
        }
    }

    async setOpenLongLivedId(followId: string, openLongLivedId: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        this.updateLongLivedIdAssociationMap(followId, existingTabFollowState.openLongLivedId, openLongLivedId);
        existingTabFollowState.openLongLivedId = openLongLivedId;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setOpenLongLivedId(followId, openLongLivedId);
        }
    }

    async setOpenLastAccess(followId: string, openLastAccess: Date) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.openLastAccess = openLastAccess;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setOpenLastAccess(followId, openLastAccess);
        }
    }

    async setFaviconUrl(followId: string, faviconUrl: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.faviconUrl = faviconUrl;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setFaviconUrl(followId, faviconUrl);
        }
    }

    async setTitle(followId: string, title: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.title = title;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setTitle(followId, title);
        }
    }

    async setUrl(followId: string, url: string) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.url = url;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setUrl(followId, url);
        }
    }

    async setReaderMode(followId: string, readerMode: boolean) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.isInReaderMode = readerMode;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setReaderMode(followId, readerMode);
        }
    }

    async setAudioMuteState(followId: string, mutedState: boolean) {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.isAudioMuted = mutedState;

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setAudioMuteState(followId, mutedState);
        }
    }

    async setWeight(followId: string, weight: number): Promise<void> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const existingTabFollowState = this.followStateMap.get(followId);

        if (null == existingTabFollowState) {
            return;
        }

        existingTabFollowState.weight = weight;
        this.weightMap.set(followId, weight);

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.setWeight(followId, weight);
        }
    }

    async remove(followId: string): Promise<void> {
        if (!this.isRetrievedFromDecorated) {
            await this.retrieveFromDecorated();
        }

        const followStateToRemove = this.followStateMap.get(followId);

        if (null == followStateToRemove) {
            return;
        }

        this.updateLongLivedIdAssociationMap(followId, followStateToRemove.openLongLivedId, null);
        this.followStateMap.delete(followId);
        this.weightMap.delete(followId);

        if (this.decoratedTabPersister) {
            this.decoratedTabPersister.remove(followId);
        }
    }
}
