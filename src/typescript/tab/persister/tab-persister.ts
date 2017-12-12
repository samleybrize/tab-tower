import { TabFollowState } from '../tab-follow-state';

export interface TabPersister {
    getAll(): Promise<TabFollowState[]>;
    getByIndex(index: number): Promise<TabFollowState>;
    persist(tab: TabFollowState): Promise<void>;
}
