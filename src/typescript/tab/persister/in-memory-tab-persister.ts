import { Tab } from '../tab';
import { TabPersister } from './tab-persister';

export class InMemoryTabPersister implements TabPersister {
    private tabList: Tab[] = [];

    async getAll(): Promise<Tab[]> {
        return this.tabList;
    }

    async add(tab: Tab): Promise<void> {
        // TODO do not add if already in memory
        this.tabList.push(tab);
    }
}
