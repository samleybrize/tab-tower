import { UnpinOpenedTab } from '../command/unpin-opened-tab';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabUnpinner {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async unpinTab(command: UnpinOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        browser.tabs.update(nativeTabId, {pinned: false});
    }
}
