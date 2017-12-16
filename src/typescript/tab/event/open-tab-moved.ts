import { TabOpenState } from '../tab-open-state';

export class OpenTabMoved {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
