@tabContextMenuCloseButton
Feature: Tab context menu - Close button
    Background:
        Given I use the small UI

    Scenario: Clicking on a tab context menu close button should close the tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the tab context menu close button of the tab 1 on the tab list "opened-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 2 browser tabs
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 2 tabs indicated

    Scenario: Clicking on a pinned tab context menu close button should close the tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I click on the tab context menu close button of the tab 0 on the tab list "pinned-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 0 visible tab on the tab list "pinned-tabs"
        And I should see 2 browser tabs
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 2 tabs indicated
