import { GetClosedTabOpenStateByOpenId } from './get-closed-tab-open-state-by-open-id';
import { GetTabAssociationByFollowId } from './get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from './get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from './get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from './get-tab-associations-with-open-state';
import { GetTabFollowStateByFollowId } from './get-tab-follow-state-by-follow-id';
import { GetTabFollowStates } from './get-tab-follow-states';
import { GetTabFollowStatesWithOpenLongLivedId } from './get-tab-follow-states-with-open-long-lived-id';
import { GetTabOpenStateByOpenId } from './get-tab-open-state-by-open-id';
import { GetTabOpenStates } from './get-tab-open-states';

export const tabQueries = [
    GetClosedTabOpenStateByOpenId,
    GetTabAssociationsWithFollowState,
    GetTabAssociationsWithOpenState,
    GetTabAssociationByFollowId,
    GetTabAssociationByOpenId,
    GetTabFollowStateByFollowId,
    GetTabFollowStates,
    GetTabFollowStatesWithOpenLongLivedId,
    GetTabOpenStateByOpenId,
    GetTabOpenStates,
];
