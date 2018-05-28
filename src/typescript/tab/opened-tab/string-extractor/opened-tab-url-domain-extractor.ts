import { StringExtractor } from '../../../utils/string-extractor';
import { OpenedTab } from '../opened-tab';

export class OpenedTabUrlDomainExtractor implements StringExtractor<OpenedTab> {
    getFrom(fromObject: OpenedTab): string {
        const urlObect = new URL(fromObject.url);

        return urlObect.hostname;
    }
}
