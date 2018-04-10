import { ReloadOpenedTab } from './command/reload-opened-tab';

export class OpenedTabReloader {
    async reloadTab(command: ReloadOpenedTab) {
        browser.tabs.reload(command.tabId, {bypassCache: false});
    }
}
