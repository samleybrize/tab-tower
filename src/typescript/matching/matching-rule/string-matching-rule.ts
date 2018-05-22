import { StringExtractor } from '../../utils/string-extractor';
import { StringListGetter } from '../../utils/string-list-getter/string-list-getter';
import { StringMatcher } from '../matcher/string-matcher/string-matcher';
import { MatchingRule } from './matching-rule';

export class StringMatchingRule<T> implements MatchingRule<T> {
    constructor(private matchAgainst: StringExtractor<T>, private matcher: StringMatcher, private toMatch: StringListGetter) {
    }

    isMatching(elementToMatch: T): boolean {
        const matchAgainstString = this.matchAgainst.getFrom(elementToMatch);
        const toMatchStringList = this.toMatch.get();

        for (const toMatchString of toMatchStringList) {
            if (this.matcher.isMatching(toMatchString, matchAgainstString)) {
                return true;
            }
        }

        return false;
    }
}
