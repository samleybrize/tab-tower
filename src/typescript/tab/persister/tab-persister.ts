import { Tab } from '../tab';

export interface TabPersister {
    getAll(): Promise<Tab[]>;
    add(tab: Tab): Promise<void>;
}
