import { TabOpenState } from '../tab-open-state';

export class OpenTabReaderModeStateUpdated {
    constructor(
        public readonly tabOpenState: TabOpenState,
        public readonly oldReaderModeState: boolean,
    ) {
    }
}
