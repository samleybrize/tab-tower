import { TabOpenState } from '../tab-open-state';

export class OpenTabUrlUpdated {
    constructor(
        public readonly tabOpenState: TabOpenState,
        public readonly oldUrl: string,
    ) {
    }
}
