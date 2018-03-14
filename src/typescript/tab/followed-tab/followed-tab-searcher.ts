import { QueryBus } from '../../bus/query-bus';
import { GetTabFollowStates } from '../query/get-tab-follow-states';
import { SearchTabFollowStates } from '../query/search-tab-follow-states';
import { TabMatcher } from '../tab-matcher';
import { TabFollowState } from './tab-follow-state';

export class FollowedTabSearcher {
    constructor(private queryBus: QueryBus, private tabMatcher: TabMatcher) {
    }

    async searchFollowStates(query: SearchTabFollowStates): Promise<TabFollowState[]> {
        const followStateList = await this.queryBus.query(new GetTabFollowStates());
        const matchingFollowStates: TabFollowState[] = [];

        for (const followState of followStateList) {
            const titleMatchTerms = this.tabMatcher.getMatchTermsFromString(query.matchOnTitle);
            const urlMatchTerms = this.tabMatcher.getMatchTermsFromString(query.matchOnUrl);

            if (this.tabMatcher.isTitleMatching(followState.title, titleMatchTerms) || this.tabMatcher.isUrlMatching(followState.url, urlMatchTerms)) {
                matchingFollowStates.push(followState);
            }
        }

        return matchingFollowStates;
    }
}
