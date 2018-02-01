import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabTitleUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
