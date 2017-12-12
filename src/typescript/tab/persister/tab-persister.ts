import { TabFollowState } from '../tab-follow-state';

export interface TabPersister {
    getAll(): Promise<TabFollowState[]>;
    getByIndex(index: number): Promise<TabFollowState>;
    add(tab: TabFollowState): Promise<void>;
}
