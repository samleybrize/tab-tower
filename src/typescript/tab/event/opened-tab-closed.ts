import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabClosed {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
