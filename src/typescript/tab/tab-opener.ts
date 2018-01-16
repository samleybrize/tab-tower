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
        const createTabOptions: browser.tabs.CreateProperties = {
            active: false,
            url: command.url,
        };

        if (browser.tabs.toggleReaderMode) {
            createTabOptions.openInReaderMode = command.readerMode;
        }

        const tab = await browser.tabs.create(createTabOptions);
        await this.waitForNewTabLoad(tab.id);

        this.associateNewTabToFollowedTab(command, tab);
    }

    private async associateNewTabToFollowedTab(openTabCommand: OpenTab, openedTab: browser.tabs.Tab) {
        if (openTabCommand.followId) {
            const tabFollowState = await this.followedTabRetriever.getById(openTabCommand.followId);
            const tabOpenState = await this.openedTabRetriever.getStillOpenedById(openedTab.id);

            this.tabAssociationMaintainer.associateOpenedTabToFollowedTab(openedTab.id, openTabCommand.followId);
            this.eventBus.publish(new OpenedTabAssociatedToFollowedTab(tabOpenState, tabFollowState));
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
