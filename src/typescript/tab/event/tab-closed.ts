import { TabOpenState } from '../opened-tab/tab-open-state';

export class TabClosed {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
