import { TabOpenState } from '../opened-tab/tab-open-state';

export class OpenedTabAudioMuteStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
