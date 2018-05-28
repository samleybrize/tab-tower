import { StringExtractor } from '../../../utils/string-extractor';
import { OpenedTab } from '../opened-tab';

export class OpenedTabUrlExtractor implements StringExtractor<OpenedTab> {
    getFrom(fromObject: OpenedTab): string {
        return fromObject.url;
    }
}
