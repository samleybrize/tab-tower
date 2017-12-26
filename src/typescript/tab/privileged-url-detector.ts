export class PrivilegedUrlDetector {
    isPrivileged(url: string, isInReaderMode?: boolean): boolean {
        if (0 === url.indexOf('about:reader?') || true === isInReaderMode) {
            return false;
        }

        const colonIndex = url.indexOf(':');
        const predicate = url.substr(0, colonIndex);
        const matchingPredicates = ['about', 'chrome', 'data', 'file', 'javascript'];

        return matchingPredicates.indexOf(predicate) >= 0;
    }
}
