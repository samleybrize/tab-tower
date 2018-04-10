import { TabFollowState } from '../tab-follow-state';

export class FollowedTabMoved {
    constructor(public readonly tabFollowState: TabFollowState) {
    }
}
