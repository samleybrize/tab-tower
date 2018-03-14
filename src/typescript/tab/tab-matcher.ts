import { StringMatcher } from '../utils/string-matcher';

export class TabMatcher {
    constructor(private stringMatcher: StringMatcher) {
    }

    getMatchTermsFromString(matchString: string): string[] {
        return matchString.toLowerCase().split(' ');
    }

    isStringMatching(stringToMatch: string, matchTerms: string[]) {
        return this.stringMatcher.isCaseSensitiveMatch(matchTerms, [stringToMatch]);
    }

    isTitleMatching(title: string, matchTerms: string[]): boolean {
        return this.isStringMatching(title, matchTerms);
    }

    isUrlMatching(url: string, matchTerms: string[]): boolean {
        const matchableUrl = this.getMatchableUrl(url);

        return this.isStringMatching(matchableUrl, matchTerms);
    }

    getMatchableUrl(fullUrl: string) {
        const url = new URL(fullUrl);

        return `${url.hostname}${url.pathname}${url.search}${url.hash}`;
    }
}
