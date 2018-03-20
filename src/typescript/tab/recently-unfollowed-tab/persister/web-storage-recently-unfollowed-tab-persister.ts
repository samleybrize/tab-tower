import { RecentlyUnfollowedTab } from '../recently-unfollowed-tab';
import { RecentlyUnfollowedTabPersister } from './recently-unfollowed-tab-persister';

export class WebStorageRecentlyUnfollowedTabPersister implements RecentlyUnfollowedTabPersister {
    private actionStack: Array<() => Promise<any>> = [];
    private isActionStackPlaying = false;

    async getByFollowId(followId: string): Promise<RecentlyUnfollowedTab> {
        const id = this.getStorageObjectId(followId);
        const storageObject = await browser.storage.local.get(id);

        if (storageObject[id]) {
            return this.createRecentlyUnfollowedTabFromStorageObject(storageObject[id]);
        }

        return null;
    }

    private getStorageObjectId(followId: string) {
        return `recentlyUnfollowedTab.${followId}`;
    }

    private async createRecentlyUnfollowedTabFromStorageObject(storageObject: any) {
        return RecentlyUnfollowedTab.fromObject(storageObject);
    }

    async getAll(): Promise<RecentlyUnfollowedTab[]> {
        const storageObject = await browser.storage.local.get();
        const recentlyUnfollowedTabList: RecentlyUnfollowedTab[] = [];

        for (const id in storageObject) {
            if (!(storageObject[id] instanceof Object) || 0 !== id.indexOf('recentlyUnfollowedTab.')) {
                continue;
            }

            recentlyUnfollowedTabList.push(await this.createRecentlyUnfollowedTabFromStorageObject(storageObject[id]));
        }

        return recentlyUnfollowedTabList;
    }

    async add(recentlyUnfollowedTab: RecentlyUnfollowedTab): Promise<void> {
        const promise = new Promise<void>((resolve, reject) => {
            this.actionStack.push(async () => {
                this.addImmediately(recentlyUnfollowedTab);
                resolve();
            });
        });

        this.startActionStackPlaying();

        return promise;
    }

    private async addImmediately(recentlyUnfollowedTab: RecentlyUnfollowedTab) {
        const id = this.getStorageObjectId(recentlyUnfollowedTab.followState.id);
        const persistObject: any = {};
        persistObject[id] = recentlyUnfollowedTab;

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
