import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabFocused {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
