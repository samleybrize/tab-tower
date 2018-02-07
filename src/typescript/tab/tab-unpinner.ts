import { UnpinTab } from './command/unpin-tab';

export class TabUnpinner {
    async unpinTab(command: UnpinTab) {
        browser.tabs.update(command.tabId, {pinned: false});
    }
}
