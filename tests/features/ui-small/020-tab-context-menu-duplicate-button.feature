@tabContextMenuDuplicateButton
Feature: Tab context menu - Duplicate button
    Background:
        Given I use the small UI

    Scenario: Clicking on a tab context menu duplicate button should duplicate the tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the tab context menu duplicate button of the tab 1 on the tab list "opened-tabs"

        Then I should see 4 visible tabs on the tab list "opened-tabs"
        And I should see 4 browser tabs
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the tab list "opened-tabs"
        And I should see the tab 0 as focused on the tab list "opened-tabs"
        And I should not see the tab 1 as focused on the tab list "opened-tabs"
        And I should not see the tab 2 as focused on the tab list "opened-tabs"
        And I should not see the tab 3 as focused on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 4 tabs indicated

    Scenario: Clicking on a pinned tab context menu duplicate button should duplicate the tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 1 visible tabs on the tab list "pinned-tabs"

        When I click on the tab context menu duplicate button of the tab 0 on the tab list "pinned-tabs"

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see 4 browser tabs
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the tab 0 as focused on the tab list "opened-tabs"
        And I should not see the tab 1 as focused on the tab list "opened-tabs"
        And I should not see the tab 2 as focused on the tab list "opened-tabs"
        And I should not see the tab 0 as focused on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 4 tabs indicated
