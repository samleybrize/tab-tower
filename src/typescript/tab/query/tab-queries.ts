import { GetTabAssociationByFollowId } from './get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from './get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from './get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from './get-tab-associations-with-open-state';

export const tabQueries = [
    GetTabAssociationsWithFollowState,
    GetTabAssociationsWithOpenState,
    GetTabAssociationByFollowId,
    GetTabAssociationByOpenId,
];
