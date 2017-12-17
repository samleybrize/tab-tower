import { TabFollowState } from '../tab-follow-state';
import { TabPersister } from './tab-persister';

export class WebStorageTabPersister implements TabPersister {
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

    async getByOpenIndex(index: number): Promise<TabFollowState> {
        const followStateList = await this.getAll();

        for (const followState of followStateList) {
            if (followState.openIndex === index) {
                return followState;
            }
        }

        return null;
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

    async persist(tabFollowState: TabFollowState) {
        const id = this.getStorageObjectId(tabFollowState.id);
        const persistObject: any = {};
        persistObject[id] = tabFollowState;

        await browser.storage.local.set(persistObject);
    }

    async setOpenIndex(followId: string, openIndex: number) {
        const followState = await this.getByFollowId(followId);
        followState.openIndex = openIndex;

        await this.persist(followState);
    }

    async setFaviconUrl(followId: string, faviconUrl: string) {
        const followState = await this.getByFollowId(followId);
        followState.faviconUrl = faviconUrl;

        await this.persist(followState);
    }

    async setTitle(followId: string, title: string) {
        const followState = await this.getByFollowId(followId);
        followState.title = title;

        await this.persist(followState);
    }

    async setUrl(followId: string, url: string) {
        const followState = await this.getByFollowId(followId);
        followState.url = url;

        await this.persist(followState);
    }

    async setReaderMode(followId: string, readerMode: boolean) {
        const followState = await this.getByFollowId(followId);
        followState.isInReaderMode = readerMode;

        await this.persist(followState);
    }

    async remove(followId: string): Promise<void> {
        const id = this.getStorageObjectId(followId);
        await browser.storage.local.remove(id);
    }
}
