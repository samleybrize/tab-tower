import { StringExtractor } from '../../../utils/string-extractor';
import { TabTag } from '../tab-tag';

export class TabTagLabelExtractor implements StringExtractor<TabTag> {
    getFrom(fromObject: TabTag): string {
        return fromObject.label;
    }
}
