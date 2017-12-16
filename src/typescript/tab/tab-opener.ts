import { sleep } from '../utils/sleep';
import { OpenTab } from './command/open-tab';
import { FollowedTabManager } from './followed-tab-manager';
import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabManager } from './opened-tab-manager';
import { OpenedTabRetriever } from './opened-tab-retriever';

export class TabOpener {
    constructor(
        private openedTabRetriever: OpenedTabRetriever,
        private followedTabManager: FollowedTabManager,
        private followedTabRetriever: FollowedTabRetriever,
    ) {
    }

    async openTab(command: OpenTab) {
        const tab = await browser.tabs.create({
            active: false,
            url: command.url,
        });
        await this.waitForNewTabLoad(tab.id);

        if (command.followId) {
            const tabFollowState = await this.followedTabRetriever.getById(command.followId);
            const tabOpenState = await this.openedTabRetriever.getById(tab.id);
            await this.followedTabManager.associateOpenedTab(tabFollowState, tabOpenState);
        }

        if (command.readerMode && browser.tabs.toggleReaderMode) {
            await browser.tabs.toggleReaderMode(tab.id);
        }
    }

    async waitForNewTabLoad(tabId: number) {
        const maxRetries = 300;

        for (let i = 0; i < maxRetries; i++) {
            await sleep(100);
            const openedTab = await browser.tabs.get(tabId);

            if ('complete' == openedTab.status && 'about:blank' != openedTab.url) {
                break;
            }
        }
    }
}
