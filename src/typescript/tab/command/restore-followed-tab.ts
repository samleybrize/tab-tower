import { TabOpenTarget } from '../tab-open-target';

export { TabOpenTarget };

export class RestoreFollowedTab {
    constructor(public readonly followId: string, public readonly target: TabOpenTarget) {
    }
}
