import { UnmuteTab } from './command/unmute-tab';

export class TabUnmuter {
    async unmuteTab(command: UnmuteTab) {
        browser.tabs.update(command.tabId, {muted: false});
    }
}
