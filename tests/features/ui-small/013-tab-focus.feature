@tabFocus
Feature: Tab focus
    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

    Scenario: Clicking on a tab title should focus its associated tab
        When I click on the title of the tab 1 on the tab list "opened-tabs"

        Then I should see the browser's tab 1 as focused
        And I should not see the tab 0 as focused on the tab list "opened-tabs"
        And I should see the tab 1 as focused on the tab list "opened-tabs"
        And I should not see the tab 2 as focused on the tab list "opened-tabs"

    Scenario: Clicking on a tab title should scroll it in the viewport
        Given window height is 300

        When I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the title of the tab 2 on the tab list "opened-tabs"

        Then the tab 2 on the tab list "opened-tabs" should be visible in the viewport
