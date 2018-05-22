import { MatchWhenAllRulesMatch } from './match-when-all-rules-match';
import { MatchingRule } from './matching-rule';
import { MatchingRuleDescriptor, MatchingRuleFactory } from './matching-rule-factory';

export interface MatchWhenAllRulesMatchDescriptor extends MatchingRuleDescriptor {
    readonly ruleList: MatchingRuleDescriptor[];
}

export class MatchWhenAllRulesMatchFactory<T> implements MatchingRuleFactory<T> {
    constructor(private matchingRuleFactoryMap: Map<string, MatchingRuleFactory<T>>) {
    }

    create(descriptor: MatchWhenAllRulesMatchDescriptor): MatchWhenAllRulesMatch<T> {
        const ruleList: Array<MatchingRule<T>> = [];

        for (const ruleDescriptor of descriptor.ruleList) {
            ruleList.push(this.createRuleFromDescriptor(ruleDescriptor));
        }

        return new MatchWhenAllRulesMatch<T>(ruleList);
    }

    private createRuleFromDescriptor(ruleDescriptor: MatchingRuleDescriptor): MatchingRule<T> {
        const factory = this.matchingRuleFactoryMap.get(ruleDescriptor.type);

        if (null == factory) {
            throw new Error(`Unable to find a factory of type "${ruleDescriptor.type}"`);
        }

        return factory.create(ruleDescriptor);
    }
}
