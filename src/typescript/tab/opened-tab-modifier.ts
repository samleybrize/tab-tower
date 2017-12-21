import { CloseTab } from './command/close-tab';
import { FocusTab } from './command/focus-tab';

export class OpenedTabModifier {
    async focusTab(command: FocusTab) {
        browser.tabs.update(command.tabId, {active: true});
    }

    async closeTab(command: CloseTab) {
        browser.tabs.remove(command.tabId);
    }
}
