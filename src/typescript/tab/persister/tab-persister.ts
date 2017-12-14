import { TabFollowState } from '../tab-follow-state';

export interface TabPersister {
    getAll(): Promise<TabFollowState[]>;
    getByOpenIndex(index: number): Promise<TabFollowState>;
    getByFollowId(followId: string): Promise<TabFollowState>;
    persist(tab: TabFollowState): Promise<void>;
    setOpenIndex(followId: string, openIndex: number): Promise<void>;
    setFaviconUrl(followId: string, faviconUrl: string): Promise<void>;
    setTitle(followId: string, title: string): Promise<void>;
    setUrl(followId: string, url: string): Promise<void>;
    setReaderMode(followId: string, readerMode: boolean): Promise<void>;
    remove(followId: string): Promise<void>;
}
