import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabPinStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
