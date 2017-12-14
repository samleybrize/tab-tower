import { TabFollowState } from '../tab-follow-state';
import { TabOpenState } from '../tab-open-state';

export class OpenedTabAssociatedToFollowedTab {
    constructor(
        public readonly tabOpenState: TabOpenState,
        public readonly tabFollowState: TabFollowState,
    ) {
    }
}
