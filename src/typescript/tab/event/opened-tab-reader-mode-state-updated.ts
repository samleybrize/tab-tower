import { TabOpenState } from '../tab-open-state';

export class OpenedTabReaderModeStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
