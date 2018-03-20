import { RecentlyUnfollowedTab } from '../recently-unfollowed-tab';

export interface RecentlyUnfollowedTabPersister {
    getByFollowId(followId: string): Promise<RecentlyUnfollowedTab>;
    getAll(): Promise<RecentlyUnfollowedTab[]>;
    add(recentlyUnfollowedTab: RecentlyUnfollowedTab): Promise<void>;
    remove(followId: string): Promise<void>;
}
