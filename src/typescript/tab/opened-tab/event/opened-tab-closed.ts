import { OpenedTab } from '../opened-tab';

export class OpenedTabClosed {
    constructor(public readonly closedTab: OpenedTab) {
    }
}
