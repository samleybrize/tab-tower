import { TabOpenState } from '../tab-open-state';

export class OpenedTabClosed {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
