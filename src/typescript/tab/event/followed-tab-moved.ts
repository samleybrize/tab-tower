import { TabFollowState } from '../followed-tab/tab-follow-state';

export class FollowedTabMoved {
    constructor(public readonly tabFollowState: TabFollowState) {
    }
}
