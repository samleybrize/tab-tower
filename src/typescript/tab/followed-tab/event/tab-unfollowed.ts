import { TabOpenState } from '../../opened-tab/tab-open-state';
import { TabFollowState } from '../tab-follow-state';

export class TabUnfollowed {
    constructor(public readonly openState: TabOpenState, public readonly oldFollowState: TabFollowState) {
    }
}
