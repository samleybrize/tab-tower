import { FocusTab } from './command/focus-tab';

export class OpenedTabModifier {
    async focusTab(command: FocusTab) {
        browser.tabs.update(command.tabId, {active: true});
    }
}
