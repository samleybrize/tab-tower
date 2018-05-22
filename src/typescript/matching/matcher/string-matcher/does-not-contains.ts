import { StringMatcher } from './string-matcher';

export class DoesNotContains implements StringMatcher {
    isMatching(toMatch: string, matchAgainst: string): boolean {
        toMatch = toMatch.toLowerCase();
        matchAgainst = matchAgainst.toLowerCase();

        return !matchAgainst.includes(toMatch);
    }
}
