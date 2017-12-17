import { EventBus } from '../bus/event-bus';
import { sleep } from '../utils/sleep';
import { OpenTab } from './command/open-tab';
import { OpenedTabAssociatedToFollowedTab } from './event/opened-tab-associated-to-followed-tab';
import { FollowedTabRetriever } from './followed-tab-retriever';
import { OpenedTabRetriever } from './opened-tab-retriever';
import { TabAssociationMaintainer } from './tab-association-maintainer';

export class TabOpener {
    constructor(
        private openedTabRetriever: OpenedTabRetriever,
        private followedTabRetriever: FollowedTabRetriever,
        private tabAssociationMaintainer: TabAssociationMaintainer,
        private eventBus: EventBus,
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

            this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(tab.id, command.followId);
            this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(tabOpenState, tabFollowState));
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
