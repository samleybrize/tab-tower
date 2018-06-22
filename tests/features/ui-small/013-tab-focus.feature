@tabFocus
Feature: Tab focus
    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

    Scenario: Clicking on a tab title should focus its associated tab
        When I click on the title of the tab 1 on the workspace "opened-tabs"

        Then I should see the browser's tab 1 as focused
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
