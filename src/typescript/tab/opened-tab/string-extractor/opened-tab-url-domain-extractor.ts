import { StringExtractor } from '../../../utils/string-extractor';
import { OpenedTab } from '../opened-tab';

export class OpenedTabUrlDomainExtractor implements StringExtractor<OpenedTab> {
    getFrom(fromObject: OpenedTab): string {
        const urlObject = new URL(fromObject.url);

        return urlObject.hostname ? urlObject.hostname : urlObject.pathname;
    }
}
