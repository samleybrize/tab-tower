import { NativeRecentlyClosedTabAssociation } from './native-recently-closed-tab-association';
import { NativeRecentlyClosedTabAssociationPersister } from './native-recently-closed-tab-association-persister';

export class WebStoragePersister implements NativeRecentlyClosedTabAssociationPersister {
    async getAll(): Promise<NativeRecentlyClosedTabAssociation[]> {
        const storageObject = await browser.storage.local.get('nativeRecentlyClosedTabs');
        const rawAssociationList = (storageObject.nativeRecentlyClosedTabs as browser.storage.StorageArray);
        const associationList: NativeRecentlyClosedTabAssociation[] = [];

        for (const id in rawAssociationList) {
            associationList.push(
                NativeRecentlyClosedTabAssociation.fromObject(rawAssociationList[id]),
            );
        }

        return associationList;
    }

    async setAll(associationList: NativeRecentlyClosedTabAssociation[]): Promise<void> {
        const persistObject: any = {};
        persistObject.nativeRecentlyClosedTabs = associationList;

        await browser.storage.local.set(persistObject);
    }
}
