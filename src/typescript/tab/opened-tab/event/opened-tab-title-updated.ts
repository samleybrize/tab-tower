import { TabOpenState } from '../tab-open-state';

export class OpenedTabTitleUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
