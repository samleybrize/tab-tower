import { FocusOpenedTab } from './command/focus-opened-tab';

export class OpenedTabFocuser {
    async focusTab(command: FocusOpenedTab) {
        browser.tabs.update(command.tabId, {active: true});
    }
}
