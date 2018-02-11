import { DuplicateTab } from './command/duplicate-tab';

export class TabDuplicator {
    async duplicateTab(command: DuplicateTab) {
        const activeTab = (await browser.tabs.query({active: true})).shift();
        await browser.tabs.duplicate(command.tabId);
        await browser.tabs.update(activeTab.id, {active: true});
    }
}
