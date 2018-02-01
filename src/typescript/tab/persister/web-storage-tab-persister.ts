import { TabFollowState } from '../followed-tab/tab-follow-state';
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

            followStateList.push(TabFollowState.fromObject(storageObject[id]));
        }

        return followStateList;
    }

    async getByFollowId(followId: string): Promise<TabFollowState> {
        const id = this.getStorageObjectId(followId);
        const storageObject = await browser.storage.local.get(id);

        if (storageObject[id]) {
            return TabFollowState.fromObject(storageObject[id]);
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
