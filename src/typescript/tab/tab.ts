import { TabOpenState } from './opened-tab/tab-open-state';
import { TabFollowState } from './tab-follow-state';

export class Tab {
    openState: TabOpenState = null;
    followState: TabFollowState = null;
}
