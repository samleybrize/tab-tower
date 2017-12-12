import { TabOpenState } from '../tab-open-state';

export class OpenTabUpdated {
    constructor(
        public readonly tabOpenState: TabOpenState,
        public readonly oldTitle: string,
        public readonly oldUrl: string,
        public readonly oldFaviconUrl: string,
    ) {
    }
}
