import { StringExtractor } from '../../../utils/string-extractor';
import { OpenedTab } from '../opened-tab';
import { OpenedTabNoprotocolUrlExtractor } from './opened-tab-noprotocol-url-extractor';
import { OpenedTabTitleExtractor } from './opened-tab-title-extractor';
import { OpenedTabUrlDomainExtractor } from './opened-tab-url-domain-extractor';
import { OpenedTabUrlExtractor } from './opened-tab-url-extractor';
import { OpenedTabUrlProtocolExtractor } from './opened-tab-url-protocol-extractor';

export class OpenedTabStringExtractors {
    private stringExtractorMap = new Map<string, StringExtractor<OpenedTab>>();

    constructor() {
        this.stringExtractorMap.set('opened-tab-title-extractor', new OpenedTabTitleExtractor());
        this.stringExtractorMap.set('opened-tab-url-extractor', new OpenedTabUrlExtractor());
        this.stringExtractorMap.set('opened-tab-noprotocol-url-extractor', new OpenedTabNoprotocolUrlExtractor());
        this.stringExtractorMap.set('opened-tab-url-domain-extractor', new OpenedTabUrlDomainExtractor());
        this.stringExtractorMap.set('opened-tab-url-protocol-extractor', new OpenedTabUrlProtocolExtractor());
    }

    getMap(): Map<string, StringExtractor<OpenedTab>> {
        return this.stringExtractorMap;
    }
}
