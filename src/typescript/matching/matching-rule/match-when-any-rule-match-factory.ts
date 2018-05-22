import { MatchWhenAnyRuleMatch } from './match-when-any-rule-match';
import { MatchingRule } from './matching-rule';
import { MatchingRuleDescriptor, MatchingRuleFactory } from './matching-rule-factory';

export interface MatchWhenAnyRuleMatchDescriptor extends MatchingRuleDescriptor {
    readonly ruleList: MatchingRuleDescriptor[];
}

export class MatchWhenAnyRuleMatchFactory<T> implements MatchingRuleFactory<T> {
    constructor(private matchingRuleFactoryMap: Map<string, MatchingRuleFactory<T>>) {
    }

    create(descriptor: MatchWhenAnyRuleMatchDescriptor): MatchWhenAnyRuleMatch<T> {
        const ruleList: Array<MatchingRule<T>> = [];

        for (const ruleDescriptor of descriptor.ruleList) {
            ruleList.push(this.createRuleFromDescriptor(ruleDescriptor));
        }

        return new MatchWhenAnyRuleMatch<T>(ruleList);
    }

    private createRuleFromDescriptor(ruleDescriptor: MatchingRuleDescriptor): MatchingRule<T> {
        const factory = this.matchingRuleFactoryMap.get(ruleDescriptor.type);

        if (null == factory) {
            throw new Error(`Unable to find a factory of type "${ruleDescriptor.type}"`);
        }

        return factory.create(ruleDescriptor);
    }
}
