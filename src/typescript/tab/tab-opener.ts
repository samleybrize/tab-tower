import { sleep } from '../utils/sleep';
import { OpenTab } from './command/open-tab';
import { FollowedTabManager } from './followed-tab-manager';
import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabManager } from './opened-tab-manager';
import { OpenedTabRetriever } from './opened-tab-retriever';

export class TabOpener {
    constructor(
        private openedTabManager: OpenedTabManager,
        private openedTabRetriever: OpenedTabRetriever,
        private followedTabManager: FollowedTabManager,
        private followedTabRetriever: FollowedTabRetriever,
    ) {
    }

    async openTab(command: OpenTab) {
        const tabId = await this.openedTabManager.openTab(command.url, command.readerMode);
        await this.waitForNewTabLoad(tabId);

        if (command.followId) {
            const tabFollowState = await this.followedTabRetriever.getById(command.followId);
            const tabOpenState = await this.openedTabRetriever.getById(tabId);
            await this.followedTabManager.associateOpenedTab(tabFollowState, tabOpenState);
        }

        if (command.readerMode) {
            await browser.tabs.toggleReaderMode(tabId);
        }
    }

    private async waitForNewTabLoad(tabId: number) {
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
