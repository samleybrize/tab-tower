import { GetFollowedTabs } from './get-followed-tabs';
import { GetOpenedTabs } from './get-opened-tabs';
import { GetTabByFollowId } from './get-tab-by-follow-id';
import { GetTabByOpenId } from './get-tab-by-open-id';

export const tabQueries = [
    GetFollowedTabs,
    GetOpenedTabs,
    GetTabByFollowId,
    GetTabByOpenId,
];
