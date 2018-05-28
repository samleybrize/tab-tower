import { DuplicateOpenedTab } from '../command/duplicate-opened-tab';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabDuplicator {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async duplicateTab(command: DuplicateOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        const activeTab = (await browser.tabs.query({active: true})).shift();
        await browser.tabs.duplicate(nativeTabId);
        await browser.tabs.update(activeTab.id, {active: true});
    }
}
