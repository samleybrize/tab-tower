import { DuplicateOpenedTab } from './command/duplicate-opened-tab';

export class OpenedTabDuplicator {
    async duplicateTab(command: DuplicateOpenedTab) {
        const activeTab = (await browser.tabs.query({active: true})).shift();
        await browser.tabs.duplicate(command.tabId);
        await browser.tabs.update(activeTab.id, {active: true});
    }
}
