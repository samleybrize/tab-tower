import { OpenedTabTagAssociationBackend } from '../opened-tab-tag-association-backend';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

const sessionKey = 'tagIdList';

export class OpenedTabTagAssociationBackendFirefox implements OpenedTabTagAssociationBackend {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async getAssociatedTabTagIdList(openedTabId: string): Promise<string[]> {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(openedTabId);
        // TODO check nativeTabId
        const tagIdList = await browser.sessions.getTabValue(nativeTabId, sessionKey) as string[];

        return null == tagIdList ? [] : tagIdList;
    }

    async addTabTagToOpenedTab(openedTabId: string, tagId: string): Promise<void> {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(openedTabId);
        // TODO check nativeTabId
        const tagIdList = await this.getAssociatedTabTagIdList(openedTabId);
        tagIdList.push(tagId);
        await this.store(nativeTabId, tagIdList);
    }

    private async store(nativeTabId: number, tagIdList: string[]) {
        await browser.sessions.setTabValue(nativeTabId, sessionKey, tagIdList);
    }

    async removeTabTagFromOpenedTab(openedTabId: string, tagId: string): Promise<void> {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(openedTabId);
        // TODO check nativeTabId
        const tagIdList = await this.getAssociatedTabTagIdList(openedTabId);
        const index = tagIdList.indexOf(tagId);

        if (index >= 0) {
            tagIdList.splice(index, 1);
            await this.store(nativeTabId, tagIdList);
        }
    }
}
