import { ReloadTab } from './command/reload-tab';

export class TabReloader {
    async reloadTab(command: ReloadTab) {
        browser.tabs.reload(command.tabId, {bypassCache: false});
    }
}
