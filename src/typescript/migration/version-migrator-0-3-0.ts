import { FollowedTabWeightCalculator } from '../tab/followed-tab/followed-tab-weight-calculator';
import { VersionMigrator } from './post-update-migrator';

// tslint:disable:class-name
export class VersionMigrator0_3_0 implements VersionMigrator {
    readonly targetVersion = '0.3.0';
    private weightCalculator: FollowedTabWeightCalculator;

    constructor() {
        this.weightCalculator = new FollowedTabWeightCalculator();
    }

    async migrate() {
        const followStateMap = await this.getAllStoredFollowedStates();
        const followStatesThatMissWeight = this.getFollowStatesThatMissWeight(followStateMap);
        await this.assignWeights(followStateMap);
    }

    private async getAllStoredFollowedStates(): Promise<Map<string, any>> {
        const storageObject = await browser.storage.local.get();
        const followStateMap = new Map<string, any>();

        for (const id in storageObject) {
            if (!(storageObject[id] instanceof Object) || 0 !== id.indexOf('followState.')) {
                continue;
            }

            followStateMap.set(id, storageObject[id]);
        }

        return followStateMap;
    }

    private getFollowStatesThatMissWeight(followStateMap: Map<string, any>) {
        const followStatesThatMissWeight = new Map<string, any>();

        followStateMap.forEach((followState, id) => {
            if (undefined !== followState.weight) {
                return;
            }

            followStatesThatMissWeight.set(id, followState);
        });

        return followStatesThatMissWeight;
    }

    private async assignWeights(followStateMap: Map<string, any>) {
        if (followStateMap.size <= 0) {
            return;
        }

        const weightList = this.weightCalculator.getWeightBetweenTwoWeights(followStateMap.size);
        const storageObject: any = {};

        followStateMap.forEach((followState, id) => {
            followState.weight = weightList.shift();
            storageObject[id] = followState;
        });

        await browser.storage.local.set(storageObject);
    }
}
