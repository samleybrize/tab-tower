import { FocusTab } from './command/focus-tab';

// TODO rename
export class OpenedTabManager {
    async focusTab(command: FocusTab) {
        browser.tabs.update(command.tabId, {active: true});
    }
}
