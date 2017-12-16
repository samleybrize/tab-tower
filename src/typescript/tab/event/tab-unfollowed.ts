import { Tab } from '../tab';
import { TabFollowState } from '../tab-follow-state';

export class TabUnfollowed {
    constructor(public readonly tab: Tab, public readonly oldTabFollowState: TabFollowState) {
    }
}
