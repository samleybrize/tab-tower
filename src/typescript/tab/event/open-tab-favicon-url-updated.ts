import { TabOpenState } from '../tab-open-state';

export class OpenTabFaviconUrlUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
