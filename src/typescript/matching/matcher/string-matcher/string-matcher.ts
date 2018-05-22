export interface StringMatcher {
    isMatching(toMatch: string, matchAgainst: string): boolean;
}
