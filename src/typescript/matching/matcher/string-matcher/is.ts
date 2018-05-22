import { StringMatcher } from './string-matcher';

export class Is implements StringMatcher {
    isMatching(toMatch: string, matchAgainst: string): boolean {
        toMatch = toMatch.toLowerCase();
        matchAgainst = matchAgainst.toLowerCase();

        return toMatch == matchAgainst;
    }
}
