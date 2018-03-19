import { TabFollowState } from '../tab-follow-state';

export interface FollowStatePersister {
    getAll(): Promise<TabFollowState[]>;
    getByFollowId(followId: string): Promise<TabFollowState>;
    getByOpenLongLivedId(openLongLivedId: string): Promise<TabFollowState>;
    getWeightList(): Promise<number[]>;
    persist(tab: TabFollowState): Promise<void>;
    setOpenLongLivedId(followId: string, openLongLivedId: string): Promise<void>;
    setOpenLastAccess(followId: string, openLastAccess: Date): Promise<void>;
    setFaviconUrl(followId: string, faviconUrl: string): Promise<void>;
    setTitle(followId: string, title: string): Promise<void>;
    setUrl(followId: string, url: string): Promise<void>;
    setReaderMode(followId: string, readerMode: boolean): Promise<void>;
    setAudioMuteState(followId: string, mutedState: boolean): Promise<void>;
    setWeight(followId: string, weight: number): Promise<void>;
    remove(followId: string): Promise<void>;
}