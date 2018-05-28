export class OpenedTabAudioMuteStateUpdated {
    constructor(public readonly tabId: string, public readonly isAudioMuted: boolean) {
    }
}
