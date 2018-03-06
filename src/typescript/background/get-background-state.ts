import { Query } from '../bus/query-bus';

export type BackgroundState = 'init'|'ready';

export class GetBackgroundState implements Query<BackgroundState> {
    readonly resultType: BackgroundState;
}
