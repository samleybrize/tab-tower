import { TabFollowState } from '../tab-follow-state';

export interface TabPersister {
    getAll(): Promise<TabFollowState[]>;
    getByOpenIndex(index: number): Promise<TabFollowState>;
    getByFollowId(followId: string): Promise<TabFollowState>;
    persist(tab: TabFollowState): Promise<void>;
    remove(tab: TabFollowState): Promise<void>;
}
