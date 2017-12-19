import { TabOpenState } from '../tab-open-state';

export class OpenedTabUrlUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
