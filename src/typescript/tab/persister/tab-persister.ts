import { TabFollowState } from '../followed-tab/tab-follow-state';

export interface TabPersister {
    getAll(): Promise<TabFollowState[]>;
    getByFollowId(followId: string): Promise<TabFollowState>;
    getByOpenLongLivedId(openLongLivedId: string): Promise<TabFollowState>;
    persist(tab: TabFollowState): Promise<void>;
    setOpenLongLivedId(followId: string, openLongLivedId: string): Promise<void>;
    setOpenLastAccess(followId: string, openLastAccess: Date): Promise<void>;
    setFaviconUrl(followId: string, faviconUrl: string): Promise<void>;
    setTitle(followId: string, title: string): Promise<void>;
    setUrl(followId: string, url: string): Promise<void>;
    setReaderMode(followId: string, readerMode: boolean): Promise<void>;
    remove(followId: string): Promise<void>;
}
