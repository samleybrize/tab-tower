import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabFaviconUrlUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
