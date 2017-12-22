export class StringMatcher {
    isCaseSensitiveMatch(searchTerms: string[], matchAgainst: string[]) {
        for (const searchTerm of searchTerms) {
            for (const t of matchAgainst) {
                if (t.indexOf(searchTerm) >= 0) {
                    return true;
                }
            }
        }

        return false;
    }
}
