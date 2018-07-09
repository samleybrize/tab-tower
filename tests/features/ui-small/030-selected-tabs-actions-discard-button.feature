@selectedTabsActionsDiscardButton
Feature: Selected tabs actions - Discard button
    Background:
        Given I use the small UI

    Scenario: Clicking on the selected tabs actions discard button should discard selected tabs
        When I open an empty tab
        And I open an empty tab

        Then I should see 3 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should not see the tab 1 as discarded on the workspace "opened-tabs"
        And I should not see the tab 2 as discarded on the workspace "opened-tabs"

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 2 on workspace "opened-tabs"
        And I click on the selected tabs actions discard button

        Then I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should see the tab 1 as discarded on the workspace "opened-tabs"
        And I should see the tab 2 as discarded on the workspace "opened-tabs"
        And the selected tabs actions context menu should not be visible
