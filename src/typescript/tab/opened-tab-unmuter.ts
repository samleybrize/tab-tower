import { UnmuteOpenedTab } from './command/unmute-opened-tab';

export class OpenedTabUnmuter {
    async unmuteTab(command: UnmuteOpenedTab) {
        browser.tabs.update(command.tabId, {muted: false});
    }
}
