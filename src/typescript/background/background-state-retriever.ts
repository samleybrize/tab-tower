import { BackgroundState, GetBackgroundState } from './get-background-state';

export class BackgroundStateRetriever {
    state: BackgroundState = 'init';

    async queryBackgroundState(query: GetBackgroundState): Promise<BackgroundState> {
        return this.state;
    }
}
