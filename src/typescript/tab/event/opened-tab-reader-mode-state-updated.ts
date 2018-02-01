import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabReaderModeStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
