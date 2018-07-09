import { DuplicateOpenedTab } from '../command/duplicate-opened-tab';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabDiscarder {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async discardTab(command: DuplicateOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        browser.tabs.discard(nativeTabId);
    }
}
