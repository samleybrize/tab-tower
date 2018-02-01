import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabMoved {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
