import { TabOpenState } from '../tab-open-state';

export class OpenedTabLoadingIsComplete {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
