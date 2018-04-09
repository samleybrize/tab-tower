import { MuteOpenedTab } from './command/mute-opened-tab';

export class OpenedTabMuter {
    async muteTab(command: MuteOpenedTab) {
        browser.tabs.update(command.tabId, {muted: true});
    }
}
