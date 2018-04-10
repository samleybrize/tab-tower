import { TabOpenState } from '../tab-open-state';

export class OpenedTabAudioMuteStateUpdated {
    constructor(public readonly tabOpenState: TabOpenState) {
    }
}
