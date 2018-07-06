@selectedTabsActionsDuplicateButton
Feature: Selected tabs actions - Reload button
    Background:
        Given I use the small UI

    Scenario: Clicking on the selected tabs actions duplicate button should duplicate selected tabs
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 2 on workspace "opened-tabs"
        And I click on the selected tabs actions duplicate button

        Then I should see 5 visible tabs on the workspace "opened-tabs"
        And I should see 5 browser tabs
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 3 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 4 on the workspace "opened-tabs"
        And I should see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"
        And I should not see the tab 4 as focused on the workspace "opened-tabs"
        And I should see the current workspace with label "All opened tabs" and 5 tabs indicated
        And the selected tabs actions context menu should not be visible
