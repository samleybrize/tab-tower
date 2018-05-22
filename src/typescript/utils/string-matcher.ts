// TODO todel
export class StringMatcher {
    isCaseSensitiveMatch(searchTerms: string[], matchAgainst: string[]) {
        for (const searchTerm of searchTerms) {
            for (const stringToMatchAgainst of matchAgainst) {
                if (stringToMatchAgainst.indexOf(searchTerm) >= 0) {
                    return true;
                }
            }
        }

        return false;
    }
}
