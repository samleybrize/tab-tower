import { TabPersister } from './persister/tab-persister';
import { Tab } from './tab';

export class FollowedTabRetriever {
    constructor(private tabPersister: TabPersister) {
    }

    async getAll(): Promise<Tab[]> {
        return this.tabPersister.getAll();
    }

    async getOpenedTabs(): Promise<Map<number, Tab>> {
        const tabList = await this.getAll();
        const tabMap: Map<number, Tab> = new Map();

        for (const tab of tabList) {
            if (!tab.isOpened) {
                continue;
            }

            tabMap.set(tab.id, tab);
        }

        return tabMap;
    }
}
