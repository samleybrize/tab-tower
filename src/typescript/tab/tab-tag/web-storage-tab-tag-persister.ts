import { TabTag } from './tab-tag';
import { TabTagPersister } from './tab-tag-persister';

const storageKey = 'tab_tags';

export class WebStorageTabTagPersister implements TabTagPersister {
    async getAll(): Promise<TabTag[]> {
        const rawTagsObject = await this.getRawTagsFromStorage();
        const tagList: TabTag[] = [];

        for (const rawTag of rawTagsObject) {
            const settings = new TabTag();
            Object.assign(settings, rawTag);
            tagList.push(rawTag);
        }

        return tagList;
    }

    private async getRawTagsFromStorage(): Promise<any> {
        const storageObject = await browser.storage.local.get(storageKey);

        return storageObject[storageKey] || [];
    }

    async store(tag: TabTag): Promise<void> {
        const rawTagsObject = await this.getRawTagsFromStorage();
        rawTagsObject[tag.id] = tag;

        await this.setStorage(rawTagsObject);
    }

    private async setStorage(rawTagsObject: any) {
        const persistObject: any = {};
        persistObject[storageKey] = rawTagsObject;

        await browser.storage.local.set(persistObject);
    }

    async delete(tag: TabTag): Promise<void> {
        const rawTagsObject = await this.getRawTagsFromStorage();
        delete rawTagsObject[tag.id];

        await this.setStorage(rawTagsObject);
    }
}
