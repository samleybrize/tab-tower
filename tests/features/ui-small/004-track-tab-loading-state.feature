@trackTabLoadingState
Feature: Track tab loading state

    Background:
        Given I use the small UI

    Scenario: Reloaded tabs should not be indicated as loading indefinitely
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should not see the tab 1 as loading on the tab list "opened-tabs"

        When I reload the tab 1

        Then I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should not see the tab 1 as loading on the tab list "opened-tabs"

    Scenario: Loading tabs should be indicated as loading
        When I open the test page "test-delayed1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        And I focus the tab 1

        And I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should see the tab 1 as loading on the tab list "opened-tabs"
        And I should see the sticky focused tab as loading

        When the tab 1 is not loading anymore

        Then I should not see the tab 0 as loading on the tab list "opened-tabs"
        And I should not see the tab 1 as loading on the tab list "opened-tabs"
        And I should not see the sticky focused tab as loading
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-delayed1" as tab 1 on the tab list "opened-tabs"
