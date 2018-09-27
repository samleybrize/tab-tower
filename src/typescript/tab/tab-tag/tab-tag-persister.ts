import { TabTag } from './tab-tag';

export interface TabTagPersister {
    getAll(): Promise<TabTag[]>;
    store(tag: TabTag): Promise<void>;
    delete(tag: TabTag): Promise<void>;
}
