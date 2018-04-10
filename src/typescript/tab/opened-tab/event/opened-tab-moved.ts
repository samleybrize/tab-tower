import { TabOpenState } from '../tab-open-state';

export class OpenedTabMoved {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
