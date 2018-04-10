import { UnpinOpenedTab } from './command/unpin-opened-tab';

export class OpenedTabUnpinner {
    async unpinTab(command: UnpinOpenedTab) {
        browser.tabs.update(command.tabId, {pinned: false});
    }
}
