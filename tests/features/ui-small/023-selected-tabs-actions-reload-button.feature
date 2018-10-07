@selectedTabsActionsReloadButton
Feature: Selected tabs actions - Reload button
    Background:
        Given I use the small UI

    Scenario: Clicking on the selected tabs actions reload button should reload selected tabs
        When I open the test page "test-delayed1"
        And I open the test page "test-delayed1"

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should not see the tab 1 as loading on the tab list "opened-tabs"
        And I should not see the tab 2 as loading on the tab list "opened-tabs"

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions reload button

        Then I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should see the tab 1 as loading on the tab list "opened-tabs"
        And I should see the tab 2 as loading on the tab list "opened-tabs"
        And the selected tabs actions context menu should not be visible
