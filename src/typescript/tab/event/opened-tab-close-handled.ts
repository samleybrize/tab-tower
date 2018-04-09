import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabCloseHandled {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
