import { PinOpenedTab } from '../command/pin-opened-tab';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabPinner {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async pinTab(command: PinOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        browser.tabs.update(nativeTabId, {pinned: true});
    }
}
