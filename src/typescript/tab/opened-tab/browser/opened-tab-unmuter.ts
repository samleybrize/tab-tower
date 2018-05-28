import { UnmuteOpenedTab } from '../command/unmute-opened-tab';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabUnmuter {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async unmuteTab(command: UnmuteOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        browser.tabs.update(nativeTabId, {muted: false});
    }
}
