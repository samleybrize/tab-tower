import { QueryBus } from '../../bus/query-bus';
import { Contains } from '../../matching/matcher/string-matcher/contains';
import { MatchWhenAnyRuleMatch } from '../../matching/matching-rule/match-when-any-rule-match';
import { MatchingRule } from '../../matching/matching-rule/matching-rule';
import { StringMatchingRule } from '../../matching/matching-rule/string-matching-rule';
import { WordBreaker } from '../../utils/string-list-getter/word-breaker';
import { OpenedTab } from './opened-tab';
import { GetOpenedTabById } from './query/get-opened-tab-by-id';
import { GetOpenedTabIdsThatMatchFilter, OpenedTabsFilter } from './query/get-opened-tab-ids-that-match-filter';
import { GetOpenedTabs } from './query/get-opened-tabs';
import { OpenedTabNoprotocolUrlExtractor } from './string-extractor/opened-tab-noprotocol-url-extractor';
import { OpenedTabTitleExtractor } from './string-extractor/opened-tab-title-extractor';
import { OpenedTabUrlDomainExtractor } from './string-extractor/opened-tab-url-domain-extractor';

export class OpenedTabFilterer {
    private matchingRuleMap = new Map<string, MatchingRule<OpenedTab>>();
    private wordBreaker: WordBreaker;

    constructor(private queryBus: QueryBus) {
        this.wordBreaker = new WordBreaker('');
        const containsStringMatcher = new Contains();

        const titleMatchingRule = new StringMatchingRule(new OpenedTabTitleExtractor(), containsStringMatcher, this.wordBreaker);
        const urlMatchingRule = new StringMatchingRule(new OpenedTabNoprotocolUrlExtractor(), containsStringMatcher, this.wordBreaker);
        const urlDomainMatchingRule = new StringMatchingRule(new OpenedTabUrlDomainExtractor(), containsStringMatcher, this.wordBreaker);

        this.matchingRuleMap.set('title', new MatchWhenAnyRuleMatch<OpenedTab>([titleMatchingRule]));
        this.matchingRuleMap.set('url', new MatchWhenAnyRuleMatch<OpenedTab>([urlMatchingRule]));
        this.matchingRuleMap.set('urlDomain', new MatchWhenAnyRuleMatch<OpenedTab>([urlDomainMatchingRule]));
        this.matchingRuleMap.set('title,url', new MatchWhenAnyRuleMatch<OpenedTab>([titleMatchingRule, urlMatchingRule]));
        this.matchingRuleMap.set('title,urlDomain', new MatchWhenAnyRuleMatch<OpenedTab>([titleMatchingRule, urlDomainMatchingRule]));
    }

    // TODO remove
    getMatchingTabs(openedTabsToFilter: OpenedTab[], filterDescriptor: OpenedTabsFilter): OpenedTab[] {
        if (!this.isFilteringNeeded(filterDescriptor)) {
            return openedTabsToFilter;
        }

        this.wordBreaker.setStringToBreak(filterDescriptor.filterText);
        const matchingRule = this.getCorrespondingMatchingRule(filterDescriptor);

        return this.getFilteredTabList(openedTabsToFilter, matchingRule);
    }

    private isFilteringNeeded(filterDescriptor: OpenedTabsFilter): boolean {
        if ('' == filterDescriptor.filterText || null == filterDescriptor.filterText || undefined == filterDescriptor.filterText) {
            return false;
        } else if (!filterDescriptor.matchOnTitle && !filterDescriptor.matchOnUrl && !filterDescriptor.matchOnUrlDomain) {
            return false;
        }

        return true;
    }

    private getCorrespondingMatchingRule(filterDescriptor: OpenedTabsFilter): MatchingRule<OpenedTab> {
        let matchingRuleId: string;

        if (filterDescriptor.matchOnTitle && filterDescriptor.matchOnUrl) {
            matchingRuleId = 'title,url';
        } else if (filterDescriptor.matchOnTitle && filterDescriptor.matchOnUrlDomain) {
            matchingRuleId = 'title,urlDomain';
        } else if (filterDescriptor.matchOnTitle) {
            matchingRuleId = 'title';
        } else if (filterDescriptor.matchOnUrl) {
            matchingRuleId = 'url';
        } else if (filterDescriptor.matchOnUrlDomain) {
            matchingRuleId = 'urlDomain';
        }

        return this.matchingRuleMap.get(matchingRuleId);
    }

    private getFilteredTabList(openedTabsToFilter: OpenedTab[], matchingRule: MatchingRule<OpenedTab>): OpenedTab[] {
        const filteredTabList: OpenedTab[] = [];

        for (const tab of openedTabsToFilter) {
            if (matchingRule.isMatching(tab)) {
                filteredTabList.push(tab);
            }
        }

        return filteredTabList;
    }

    async queryOpenedTabIdsThatMatchFilter(query: GetOpenedTabIdsThatMatchFilter): Promise<string[]> {
        const tabList = query.tabIdListToMatch ? await this.getTabsFromIdList(query.tabIdListToMatch) : await this.getAllTabs();
        const matchingRule = this.getCorrespondingMatchingRule(query.filter);
        let matchingTabList = tabList;

        if (this.isFilteringNeeded(query.filter)) {
            matchingTabList = this.getFilteredTabList(tabList, matchingRule);
        }

        const matchingTabIdList: string[] = [];

        for (const tab of matchingTabList) {
            matchingTabIdList.push(tab.id);
        }

        return matchingTabIdList;
    }

    private async getTabsFromIdList(tabIdList: string[]) {
        const tabList: OpenedTab[] = [];

        for (const tabId of tabIdList) {
            const tab = await this.queryBus.query(new GetOpenedTabById(tabId));
            tabList.push(tab);
        }

        return tabList;
    }

    private async getAllTabs() {
        return this.queryBus.query(new GetOpenedTabs());
    }
}
