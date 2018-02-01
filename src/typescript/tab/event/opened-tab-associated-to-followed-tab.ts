import { TabOpenState } from '../opened-tab/tab-open-state';
import { TabFollowState } from '../tab-follow-state';

export class OpenedTabAssociatedToFollowedTab {
    constructor(
        public readonly tabOpenState: TabOpenState,
        public readonly tabFollowState: TabFollowState,
    ) {
    }
}
