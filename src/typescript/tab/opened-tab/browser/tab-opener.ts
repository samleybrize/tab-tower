import { OpenTab } from '../command/open-tab';

export class TabOpener {
    async openTab(command: OpenTab) {
        await browser.tabs.create({url: command.url, active: command.focusNewTab});
    }
}
