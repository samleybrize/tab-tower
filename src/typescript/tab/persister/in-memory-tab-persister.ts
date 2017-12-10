import { Tab } from '../tab';
import { TabPersister } from './tab-persister';

export class InMemoryTabPersister implements TabPersister {
    async getAll(): Promise<Tab[]> {
        // TODO
        return [];
    }
}
