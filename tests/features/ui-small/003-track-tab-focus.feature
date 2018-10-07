@trackTabFocus
Feature: Track tab focus

    Background:
        Given I use the small UI

    Scenario: Focused tabs should be indicated as focused in the opened tabs list
        When I open the test page "test-page1"
        And I focus the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as focused on the tab list "opened-tabs"
        And I should see the tab 1 as focused on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should not see the tab 0 as focused on the tab list "opened-tabs"
        And I should see the tab 1 as focused on the tab list "opened-tabs"

        When I focus the tab 0

        Then I should see the tab 0 as focused on the tab list "opened-tabs"
        And I should not see the tab 1 as focused on the tab list "opened-tabs"

    Scenario: Focused tab should be visible in the viewport
        Given window height is 300

        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I focus the tab 3

        Then the tab 3 on the tab list "opened-tabs" should be visible in the viewport

    Scenario: Focused tab should be visible in the viewport at startup
        Given window height is 300

        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I focus the tab 3
        And I reload the tab 0

        Then I should see 4 visible tabs on the tab list "opened-tabs"
        And the tab 3 on the tab list "opened-tabs" should be visible in the viewport
