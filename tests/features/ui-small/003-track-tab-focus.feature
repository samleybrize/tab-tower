@trackTabFocus
Feature: Track tab focus

    Background:
        Given I use the small UI

    Scenario: Focused tabs should be indicated as focused in the opened tabs list
        When I open the test page "test-page1"
        And I focus the tab 1

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"

        When I reload the tab 0

        Then I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"

        When I focus the tab 0

        Then I should see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
