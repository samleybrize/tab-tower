@selectedTabsActionsCloseButton
Feature: Selected tabs actions - Close button
    Background:
        Given I use the small UI

    Scenario: Clicking on the selected tabs actions close button should close selected tabs
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions close button

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 browser tabs
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 1 tabs indicated
        And the selected tabs actions context menu should not be visible
