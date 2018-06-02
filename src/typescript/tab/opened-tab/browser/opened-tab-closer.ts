import { QueryBus } from '../../../bus/query-bus';
import { sleep } from '../../../utils/sleep';
import { CloseOpenedTab } from '../command/close-opened-tab';
import { CloseOpenedTabsToTheRight } from '../command/close-opened-tabs-to-the-right';
import { CloseOtherOpenedTabs } from '../command/close-other-opened-tabs';
import { GetOpenedTabById, GetOpenedTabs } from '../query';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabCloser {
    constructor(private queryBus: QueryBus, private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async closeTab(command: CloseOpenedTab) {
        const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(command.tabId);

        if (null == nativeTabId) {
            return;
        }

        browser.tabs.remove(nativeTabId);
    }

    async closeOtherTabs(command: CloseOtherOpenedTabs) {
        const openedTabList = await this.queryBus.query(new GetOpenedTabs());

        for (const openedTab of openedTabList) {
            if (command.tabsToKeepIdList.indexOf(openedTab.id) >= 0) {
                continue;
            }

            const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(openedTab.id);

            if (nativeTabId) {
                browser.tabs.remove(nativeTabId);
            }
        }
    }

    async closeTabsToTheRight(command: CloseOpenedTabsToTheRight) {
        const referenceOpenedTab = await this.queryBus.query(new GetOpenedTabById(command.referenceTabId));
        const openedTabList = await this.queryBus.query(new GetOpenedTabs());

        for (const openedTab of openedTabList) {
            if (openedTab.position <= referenceOpenedTab.position) {
                continue;
            }

            const nativeTabId = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(openedTab.id);

            if (nativeTabId) {
                browser.tabs.remove(nativeTabId);
            }
        }
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
