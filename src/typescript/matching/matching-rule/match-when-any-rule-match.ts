import { MatchingRule } from './matching-rule';

export class MatchWhenAnyRuleMatch<T> implements MatchingRule<T> {
    constructor(private ruleList: Array<MatchingRule<T>>) {
    }

    isMatching(elementToMatch: T): boolean {
        for (const rule of this.ruleList) {
            if (rule.isMatching(elementToMatch)) {
                return true;
            }
        }

        return false;
    }
}
