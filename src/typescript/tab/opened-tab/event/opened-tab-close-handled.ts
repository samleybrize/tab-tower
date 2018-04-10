import { TabOpenState } from '../tab-open-state';

export class OpenedTabCloseHandled {
    constructor(public readonly closedTab: TabOpenState) {
    }
}
