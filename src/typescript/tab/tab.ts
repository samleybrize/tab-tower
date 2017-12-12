import { TabFollowState } from './tab-follow-state';
import { TabOpenState } from './tab-open-state';

export class Tab {
    openState: TabOpenState = null;
    followState: TabFollowState = null;

    get isOpened(): boolean {
        return null !== this.openState;
    }

    get isFollowed(): boolean {
        return null !== this.followState;
    }
}
