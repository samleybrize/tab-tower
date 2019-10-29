@trackTabDiscardState
Feature: Track tab discard state
    Background:
        Given I use the small UI

    Scenario: Discarded tabs should be indicated as discarded in the opened tabs list
        When I open an empty tab
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should not see the tab 1 as discarded on the tab list "opened-tabs"

        When I discard the tab 1

        Then I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should see the tab 1 as discarded on the tab list "opened-tabs"

    Scenario: Discarded tabs should be indicated as discarded in the pinned tabs list
        When I open an empty tab
        And I focus the tab 1
        And I focus the tab 0
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should not see the tab 0 as discarded on the tab list "pinned-tabs"

        When I discard the tab 0

        Then I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should see the tab 0 as discarded on the tab list "pinned-tabs"

    Scenario: Tabs that have not been focused should be indicated as discarded in the opened tabs list
        When I open an empty tab

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should see the tab 1 as discarded on the tab list "opened-tabs"

    Scenario: Tabs that have not been focused should be indicated as discarded in the pinned tabs list
        When I open an empty tab
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should see the tab 0 as discarded on the tab list "pinned-tabs"
