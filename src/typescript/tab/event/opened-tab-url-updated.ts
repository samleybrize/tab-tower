import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabUrlUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
