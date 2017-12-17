import { TabFollowState } from '../tab-follow-state';
import { TabOpenState } from '../tab-open-state';

export class TabUnfollowed {
    constructor(public readonly openState: TabOpenState, public readonly oldFollowState: TabFollowState) {
    }
}
