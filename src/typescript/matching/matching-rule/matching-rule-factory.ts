import { MatchingRule } from './matching-rule';

export interface MatchingRuleDescriptor {
    readonly type: string;
}

export interface MatchingRuleFactory<T> {
    create(descriptor: MatchingRuleDescriptor): MatchingRule<T>;
}
