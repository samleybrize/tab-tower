import { Tab } from '../tab';

export interface TabPersister {
    getAll(): Promise<Tab[]>;
}
