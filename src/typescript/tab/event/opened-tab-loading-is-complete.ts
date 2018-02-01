import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabLoadingIsComplete {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
