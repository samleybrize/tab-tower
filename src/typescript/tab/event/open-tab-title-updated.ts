import { TabOpenState } from '../tab-open-state';

export class OpenTabTitleUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
