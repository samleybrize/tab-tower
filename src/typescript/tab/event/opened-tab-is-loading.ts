import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabIsLoading {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
