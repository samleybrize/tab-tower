import { sleep } from '../utils/sleep';
import { CloseTab } from './command/close-tab';

export class TabCloser {
    async closeTab(command: CloseTab) {
        browser.tabs.remove(command.tabId);
    }

    async waitForTabClose(tabId: number) {
        const maxRetries = 300;

        try {
            for (let i = 0; i < maxRetries; i++) {
                await sleep(100);
                await browser.tabs.get(tabId);
            }
        } catch (error) {
            return;
        }
    }
}
