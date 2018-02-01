import { TabFollowState } from './followed-tab/tab-follow-state';
import { TabOpenState } from './opened-tab/tab-open-state';

export class Tab {
    openState: TabOpenState = null;
    followState: TabFollowState = null;
}
