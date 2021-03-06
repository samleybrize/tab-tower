@tabContextMenuPinButton
Feature: Tab context menu - Pin and unpin button
    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

    Scenario: Clicking on a tab context menu pin button should pin the tab
        When I click on the tab context menu pin button of the tab 1 on the tab list "opened-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the tab 0 as focused on the tab list "opened-tabs"
        And I should not see the tab 1 as focused on the tab list "opened-tabs"
        And I should not see the tab 0 as focused on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 3 tabs indicated
        And I should not see the pin button on the tab context menu of the tab 0 on the tab list "pinned-tabs"
        And I should see the unpin button on the tab context menu of the tab 0 on the tab list "pinned-tabs"

    Scenario: Clicking on a tab context menu unpin button should unpin the tab
        When I pin the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"

        When I click on the tab context menu unpin button of the tab 0 on the tab list "pinned-tabs"

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should see 0 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "opened-tabs"
        And I should see the small UI as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "opened-tabs"
        And I should not see the tab 0 as focused on the tab list "opened-tabs"
        And I should see the tab 1 as focused on the tab list "opened-tabs"
        And I should not see the tab 2 as focused on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 3 tabs indicated
        And I should see the pin button on the tab context menu of the tab 0 on the tab list "opened-tabs"
        And I should not see the unpin button on the tab context menu of the tab 0 on the tab list "opened-tabs"
