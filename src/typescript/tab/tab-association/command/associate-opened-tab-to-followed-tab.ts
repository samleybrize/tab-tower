import { TabFollowState } from '../../followed-tab/tab-follow-state';
import { TabOpenState } from '../../opened-tab/tab-open-state';

export class AssociateOpenedTabToFollowedTab {
    constructor(public readonly openState: TabOpenState, public readonly followState: TabFollowState) {
    }
}
