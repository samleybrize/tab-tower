import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { GoToControlCenter } from '../tab/command/go-to-control-center';
import { RestoreFollowedTab, TabOpenTarget } from '../tab/followed-tab/command/restore-followed-tab';
import { GetTabFollowStateByFollowId } from '../tab/followed-tab/query/get-tab-follow-state-by-follow-id';
import { SearchTabFollowStates } from '../tab/followed-tab/query/search-tab-follow-states';

export class OmniboxSuggestionHandler {
    constructor(private commandBus: CommandBus, private queryBus: QueryBus, defaultSuggestionLabel: string) {
        browser.omnibox.setDefaultSuggestion({description: defaultSuggestionLabel});
        browser.omnibox.onInputChanged.addListener(this.requestSuggestions.bind(this));
        browser.omnibox.onInputEntered.addListener(this.handleSuggestionSelection.bind(this));
    }

    private async requestSuggestions(searchText: string, suggest: (suggestionList: browser.omnibox.SuggestResult[]) => void) {
        const suggestionList = await this.getSuggestions(searchText);
        suggest(suggestionList);
    }

    async getSuggestions(searchText: string): Promise<browser.omnibox.SuggestResult[]> {
        if (0 == searchText.trim().length) {
            return [];
        }

        const matchingFollowStateList = await this.queryBus.query(new SearchTabFollowStates(searchText, searchText));
        const suggestResultList: browser.omnibox.SuggestResult[] = [];

        for (const followState of matchingFollowStateList) {
            suggestResultList.push({
                content: followState.id,
                description: `${followState.title} - ${followState.url}`,
            });
        }

        return suggestResultList;
    }

    async handleSuggestionSelection(followId: string, disposition: browser.omnibox.OnInputEnteredDisposition) {
        const followState = await this.queryBus.query(new GetTabFollowStateByFollowId(followId));

        if (followState) {
            const openTarget = this.getOpenTargetFromDisposition(disposition);
            await this.commandBus.handle(new RestoreFollowedTab(followId, openTarget));
        } else {
            this.commandBus.handle(new GoToControlCenter());
        }
    }

    private getOpenTargetFromDisposition(disposition: browser.omnibox.OnInputEnteredDisposition) {
        switch (disposition) {
            case 'currentTab':
            case 'newForegroundTab':
                return TabOpenTarget.NewForegroundTab;

            case 'newBackgroundTab':
            default:
                return TabOpenTarget.NewBackgroundTab;
        }
    }
}
