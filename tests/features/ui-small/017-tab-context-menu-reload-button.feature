@tabContextMenuReloadButton
Feature: Tab context menu - Reload button
    Background:
        Given I use the small UI

    Scenario: Clicking on a tab context menu reload button should reload the tab
        When I open the test page "test-delayed1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should not see the tab 1 as loading on the tab list "opened-tabs"

        When I click on the tab context menu reload button of the tab 1 on the tab list "opened-tabs"

        Then I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should see the tab 1 as loading on the tab list "opened-tabs"

    Scenario: Clicking on a pinned tab context menu reload button should reload the tab
        When I open the test page "test-delayed1"
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should not see the tab 0 as loading on the tab list "pinned-tabs"

        When I click on the tab context menu reload button of the tab 0 on the tab list "pinned-tabs"

        Then I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should see the tab 0 as loading on the tab list "pinned-tabs"
