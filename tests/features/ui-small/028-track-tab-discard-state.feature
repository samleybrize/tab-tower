@trackTabDiscardState
Feature: Track tab discard state
    Background:
        Given I use the small UI

    Scenario: Discarded tabs should be indicated as discarded in the opened tabs list
        When I open an empty tab

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should not see the tab 1 as discarded on the workspace "opened-tabs"

        When I discard the tab 1

        Then I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should see the tab 1 as discarded on the workspace "opened-tabs"

    Scenario: Discarded tabs should be indicated as discarded in the pinned tabs list
        When I open an empty tab
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should not see the tab 0 as discarded on the workspace "pinned-tabs"

        When I discard the tab 0

        Then I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should see the tab 0 as discarded on the workspace "pinned-tabs"
