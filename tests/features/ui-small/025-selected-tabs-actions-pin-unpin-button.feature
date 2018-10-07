@selectedTabsActionsPinButton
Feature: Selected tabs actions - Pin and unpin button
    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

    Scenario: Clicking on the selected tabs actions pin button should pin selected tabs
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions pin button

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 2 visible tabs on the tab list "pinned-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "pinned-tabs"
        And I should see the tab 0 as focused on the tab list "opened-tabs"
        And I should not see the tab 0 as focused on the tab list "pinned-tabs"
        And I should not see the tab 1 as focused on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 3 tabs indicated
        And the selected tabs actions context menu should not be visible

    Scenario: Clicking on the selected tabs actions unpin button should unpin selected tabs
        When I pin the tab 1
        And I pin the tab 2

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 2 visible tabs on the tab list "pinned-tabs"

        When I click on the tab selector of the tab 0 on tab list "pinned-tabs"
        And I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the selected tabs actions unpin button

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should see 0 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the small UI as tab 2 on the tab list "opened-tabs"
        And I should not see the tab 0 as focused on the tab list "opened-tabs"
        And I should not see the tab 1 as focused on the tab list "opened-tabs"
        And I should see the tab 2 as focused on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 3 tabs indicated
        And the selected tabs actions context menu should not be visible
