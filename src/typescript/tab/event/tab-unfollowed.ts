import { TabFollowState } from '../tab-follow-state';
import { Tab } from '../tab';

export class TabUnfollowed {
    constructor(public readonly tab: Tab, public readonly oldTabFollowState: TabFollowState) {
    }
}
