import { GetClosedTabOpenStateByOpenId } from './get-closed-tab-open-state-by-open-id';
import { GetFollowIdAssociatedToOpenId } from './get-follow-id-associated-to-open-id';
import { GetOpenIdAssociatedToFollowId } from './get-open-id-associated-to-follow-id';
import { GetRecentlyUnfollowedTabs } from './get-recently-unfollowed-tabs';
import { GetRecentlyUnfollowedTabByFollowId } from './get-recently-unfollowed-tabs-by-follow-id';
import { GetSessionIdAssociatedToOpenLongLivedId } from './get-session-id-associated-to-open-long-lived-id';
import { GetTabAssociationByFollowId } from './get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from './get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from './get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from './get-tab-associations-with-open-state';
import { GetTabFollowStateByFollowId } from './get-tab-follow-state-by-follow-id';
import { GetTabFollowStateWeightList } from './get-tab-follow-state-weight-list';
import { GetTabFollowStates } from './get-tab-follow-states';
import { GetTabFollowStatesWithOpenLongLivedId } from './get-tab-follow-states-with-open-long-lived-id';
import { GetTabOpenStateByOpenId } from './get-tab-open-state-by-open-id';
import { GetTabOpenStates } from './get-tab-open-states';
import { SearchTabFollowStates } from './search-tab-follow-states';

export const tabQueries = [
    GetClosedTabOpenStateByOpenId,
    GetFollowIdAssociatedToOpenId,
    GetOpenIdAssociatedToFollowId,
    GetRecentlyUnfollowedTabByFollowId,
    GetRecentlyUnfollowedTabs,
    GetSessionIdAssociatedToOpenLongLivedId,
    GetTabAssociationByFollowId,
    GetTabAssociationByOpenId,
    GetTabAssociationsWithFollowState,
    GetTabAssociationsWithOpenState,
    GetTabFollowStateByFollowId,
    GetTabFollowStateWeightList,
    GetTabFollowStatesWithOpenLongLivedId,
    GetTabFollowStates,
    GetTabOpenStateByOpenId,
    GetTabOpenStates,
    SearchTabFollowStates,
];
