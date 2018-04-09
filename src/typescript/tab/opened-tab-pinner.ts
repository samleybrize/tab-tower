import { PinOpenedTab } from './command/pin-opened-tab';

export class OpenedTabPinner {
    async pinTab(command: PinOpenedTab) {
        browser.tabs.update(command.tabId, {pinned: true});
    }
}
