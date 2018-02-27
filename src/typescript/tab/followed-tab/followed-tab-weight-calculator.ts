export class FollowedTabWeightCalculator {
    getWeightBetweenTwoWeights(numberOfWeightsToReturn: number, min?: number, max?: number) {
        if ('number' != typeof min) {
            min = Number.MIN_SAFE_INTEGER;
        }

        if ('number' != typeof max) {
            max = Number.MAX_SAFE_INTEGER;
        }

        if (numberOfWeightsToReturn < 1) {
            console.error(`FollowedTabWeightCalculator: the number of weight to return must be positive (${numberOfWeightsToReturn} given)`);

            return [];
        } else if (min >= max) {
            console.error(`FollowedTabWeightCalculator: "min" must be lower than "max" (respectively "${min}" and "${max}" given)`);

            return [];
        } else if (max - min - 1 < numberOfWeightsToReturn) {
            console.error(`FollowedTabWeightCalculator: not enough available weights ("min" is "${min}", "max" is "${max}")`);

            return [];
        }

        return this.calculateWeightBetweenTwoWeights(numberOfWeightsToReturn, min, max);
    }

    private calculateWeightBetweenTwoWeights(numberOfWeightsToReturn: number, min: number, max: number) {
        const weightList = [];
        const divider = numberOfWeightsToReturn + 1;
        const step = Math.floor((max / divider) - (min / divider));
        let nextWeight = min;

        for (let i = 0; i < numberOfWeightsToReturn; i++) {
            nextWeight += step;
            weightList.push(nextWeight);
        }

        return weightList;
    }

    getWeightBeforeWeight(numberOfWeightsToReturn: number, max: number) {
        return this.getWeightBetweenTwoWeights(numberOfWeightsToReturn, null, max);
    }
}
