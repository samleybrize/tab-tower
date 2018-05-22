export interface MatchingRule<T> {
    isMatching(elementToMatch: T): boolean;
}
