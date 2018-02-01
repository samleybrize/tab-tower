import { TabFollowState } from '../followed-tab/tab-follow-state';
import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabAssociatedToFollowedTab {
    constructor(
        public readonly tabOpenState: TabOpenState,
        public readonly tabFollowState: TabFollowState,
    ) {
    }
}
