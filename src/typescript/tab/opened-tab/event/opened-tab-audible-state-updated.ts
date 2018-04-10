import { TabOpenState } from '../tab-open-state';

export class OpenedTabAudibleStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
