import { TabOpenState } from '../opened-tab/tab-open-state';

export class TabCloseHandled {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
