import { TabOpenState } from '../tab-open-state';

export class OpenedTabPinStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
