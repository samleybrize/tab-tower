import { TabAssociation } from '../tab-association/tab-association';

export class OpenedTabFollowed {
    constructor(public readonly tab: TabAssociation) {
    }
}
