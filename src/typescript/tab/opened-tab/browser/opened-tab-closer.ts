import { sleep } from '../../../utils/sleep';
import { CloseOpenedTab } from '../command/close-opened-tab';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabCloser {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async closeTab(command: CloseOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        browser.tabs.remove(nativeTabId);
    }

    async waitForTabClose(tabId: number) {
        const maxRetries = 300;

        try {
            for (let i = 0; i < maxRetries; i++) {
                await sleep(100);
                await browser.tabs.get(tabId);
            }
        } catch (error) {
            return;
        }
    }
}
