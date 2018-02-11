import { MuteTab } from './command/mute-tab';

export class TabMuter {
    async muteTab(command: MuteTab) {
        browser.tabs.update(command.tabId, {muted: true});
    }
}
