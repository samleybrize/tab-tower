import { FollowedTabWeightCalculator } from '../followed-tab-weight-calculator';
import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

export class WebStorageTabPersister implements TabPersister {
    private actionStack: Array<() => Promise<any>> = [];
    private isActionStackPlaying = false;

    async getAll(): Promise<TabFollowState[]> {
        const storageObject = await browser.storage.local.get();
        const followStateList: TabFollowState[] = [];

        for (const id in storageObject) {
            if (!(storageObject[id] instanceof Object) || 0 !== id.indexOf('followState.')) {
                continue;
            }

            followStateList.push(await this.createFollowStateFromStorageObject(storageObject[id]));
        }

        return followStateList;
    }

    private async createFollowStateFromStorageObject(storageObject: any) {
        return TabFollowState.fromObject(storageObject);
    }

    async getByFollowId(followId: string): Promise<TabFollowState> {
        const id = this.getStorageObjectId(followId);
        const storageObject = await browser.storage.local.get(id);

        if (storageObject[id]) {
            return this.createFollowStateFromStorageObject(storageObject[id]);
        }

        return null;
    }

    private getStorageObjectId(followId: string) {
        return `followState.${followId}`;
    }

    async getByOpenLongLivedId(openLongLivedId: string): Promise<TabFollowState> {
        const followStateList = await this.getAll();

        for (const followState of followStateList) {
            if (openLongLivedId && followState.openLongLivedId === openLongLivedId) {
                return followState;
            }
        }

        return null;
    }

    async getWeightList(): Promise<number[]> {
        const followStateList = await this.getAll();
        const weightList = [];

        for (const followState of followStateList) {
            weightList.push(followState.weight);
        }

        return weightList;
    }

    async persist(tabFollowState: TabFollowState) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                this.persistImmediately(tabFollowState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    private async persistImmediately(tabFollowState: TabFollowState) {
        const id = this.getStorageObjectId(tabFollowState.id);
        const persistObject: any = {};
        persistObject[id] = tabFollowState;

        await browser.storage.local.set(persistObject);
    }

    private async startActionStackPlaying() {
        if (this.isActionStackPlaying) {
            return;
        }

        this.isActionStackPlaying = true;
        setTimeout(this.playActionStack.bind(this), 1);
    }

    private async playActionStack() {
        this.isActionStackPlaying = true;

        while (this.actionStack.length > 0) {
            const action = this.actionStack.shift();
            await action();
        }

        this.isActionStackPlaying = false;
    }

    async setOpenLongLivedId(followId: string, openLongLivedId: string) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.openLongLivedId = openLongLivedId;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setOpenLastAccess(followId: string, openLastAccess: Date) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.openLastAccess = openLastAccess;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setFaviconUrl(followId: string, faviconUrl: string) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.faviconUrl = faviconUrl;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setTitle(followId: string, title: string) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.title = title;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setUrl(followId: string, url: string) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.url = url;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setReaderMode(followId: string, readerMode: boolean) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.isInReaderMode = readerMode;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setAudioMuteState(followId: string, mutedState: boolean) {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.isAudioMuted = mutedState;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async setWeight(followId: string, weight: number): Promise<void> {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const followState = await this.getByFollowId(followId);
                followState.weight = weight;

                await this.persistImmediately(followState);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    async remove(followId: string): Promise<void> {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                const id = this.getStorageObjectId(followId);
                await browser.storage.local.remove(id);

                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }
}
