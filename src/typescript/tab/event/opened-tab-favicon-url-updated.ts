import { TabOpenState } from '../tab-open-state';

export class OpenedTabFaviconUrlUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
