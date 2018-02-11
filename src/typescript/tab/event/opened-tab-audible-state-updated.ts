import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabAudibleStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
