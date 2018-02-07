import { PinTab } from './command/pin-tab';

export class TabPinner {
    async pinTab(command: PinTab) {
        browser.tabs.update(command.tabId, {pinned: true});
    }
}
