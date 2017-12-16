import { sleep } from '../utils/sleep';

export class TabCloser {
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
