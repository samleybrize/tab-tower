import { TabFollowState } from '../followed-tab/tab-follow-state';
import { TabOpenState } from '../opened-tab/tab-open-state';

export class TabAssociation {
    openState: TabOpenState = null;
    followState: TabFollowState = null;
}
