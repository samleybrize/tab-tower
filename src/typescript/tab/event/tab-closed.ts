import { TabOpenState } from '../tab-open-state';

export class TabClosed {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
