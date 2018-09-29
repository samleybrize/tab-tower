import { QueryBus } from '../../bus/query-bus';
import { Contains } from '../../matching/matcher/string-matcher/contains';
import { MatchWhenAnyRuleMatch } from '../../matching/matching-rule/match-when-any-rule-match';
import { MatchingRule } from '../../matching/matching-rule/matching-rule';
import { StringMatchingRule } from '../../matching/matching-rule/string-matching-rule';
import { WordBreaker } from '../../utils/string-list-getter/word-breaker';
import { GetTabTagById } from './query/get-tab-tag-by-id';
import { GetTabTagIdsThatMatchFilter, TabTagFilter } from './query/get-tab-tag-ids-that-match-filter';
import { GetTabTags } from './query/get-tab-tags';
import { TabTagLabelExtractor } from './string-extractor/tab-tag-label-extractor';
import { TabTag } from './tab-tag';

export class TabTagFilterer {
    private matchingRuleMap = new Map<string, MatchingRule<TabTag>>();
    private wordBreaker: WordBreaker;

    constructor(private queryBus: QueryBus) {
        this.wordBreaker = new WordBreaker('');
        const containsStringMatcher = new Contains();

        const labelMatchingRule = new StringMatchingRule(new TabTagLabelExtractor(), containsStringMatcher, this.wordBreaker);

        this.matchingRuleMap.set('label', new MatchWhenAnyRuleMatch<TabTag>([labelMatchingRule]));
    }

    async queryTabTagIdsThatMatchFilter(query: GetTabTagIdsThatMatchFilter): Promise<string[]> {
        const tagList = query.tagIdListToMatch ? await this.getTagsFromIdList(query.tagIdListToMatch) : await this.getAllTags();
        const matchingRule = this.getCorrespondingMatchingRule(query.filter);
        this.wordBreaker.setStringToBreak(query.filter.filterText);
        let matchingTagList = tagList;

        if (this.isFilteringNeeded(query.filter)) {
            matchingTagList = this.getFilteredTagList(tagList, matchingRule);
        }

        const matchingTagIdList: string[] = [];

        for (const tab of matchingTagList) {
            matchingTagIdList.push(tab.id);
        }

        return matchingTagIdList;
    }

    private async getAllTags() {
        return this.queryBus.query(new GetTabTags());
    }

    private async getTagsFromIdList(tagIdList: string[]) {
        const tagList: TabTag[] = [];

        for (const tagId of tagIdList) {
            const tag = await this.queryBus.query(new GetTabTagById(tagId));
            tagList.push(tag);
        }

        return tagList;
    }

    private getCorrespondingMatchingRule(filterDescriptor: TabTagFilter): MatchingRule<TabTag> {
        return this.matchingRuleMap.get('label');
    }

    private isFilteringNeeded(filterDescriptor: TabTagFilter): boolean {
        if ('' == filterDescriptor.filterText || null == filterDescriptor.filterText || undefined == filterDescriptor.filterText) {
            return false;
        }

        return true;
    }

    private getFilteredTagList(tagsToFilter: TabTag[], matchingRule: MatchingRule<TabTag>): TabTag[] {
        const filteredTagList: TabTag[] = [];

        for (const tag of tagsToFilter) {
            if (matchingRule.isMatching(tag)) {
                filteredTagList.push(tag);
            }
        }

        return filteredTagList;
    }
}
