@tabContextMenuDiscardButton
Feature: Tab context menu - Discard button
    Background:
        Given I use the small UI

    Scenario: Clicking on a tab context menu discard button should discard the tab
        When I open an empty tab
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should not see the tab 1 as discarded on the tab list "opened-tabs"

        When I click on the tab context menu discard button of the tab 1 on the tab list "opened-tabs"

        Then I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should see the tab 1 as discarded on the tab list "opened-tabs"
        And I should not see the discard button on the tab context menu of the tab 1 on the tab list "opened-tabs"

    Scenario: Clicking on a pinned tab context menu discard button should discard the tab
        When I open an empty tab
        And I focus the tab 1
        And I focus the tab 0
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should not see the tab 0 as discarded on the tab list "pinned-tabs"

        When I click on the tab context menu discard button of the tab 0 on the tab list "pinned-tabs"

        Then I should not see the tab 0 as discarded on the tab list "opened-tabs"
        And I should see the tab 0 as discarded on the tab list "pinned-tabs"
        And I should not see the discard button on the tab context menu of the tab 0 on the tab list "pinned-tabs"
