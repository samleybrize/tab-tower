@trackTabClosing
Feature: Track tab closing

    Background:
        Given I use the small UI

    Scenario: Closed tabs should not appear in the opened tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I close the tab 1

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"

    Scenario: Closed tabs should not appear in the opened tabs list after a reload
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I reload the tab 1

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I close the tab 1

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"

    Scenario: Closing a tab should update the focused tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I focus the tab 1

        Then I should see the tab 1 as focused on the workspace "opened-tabs"

        When I close the tab 1

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"

    Scenario: Closing several tabs should update the focused tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I focus the tab 1

        Then I should see the tab 1 as focused on the workspace "opened-tabs"

        When I close the tab 1
        And I close the tab 1

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"

    Scenario: Closed pinned tabs should not appear in the opened tabs list or in the pinned tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I pin the tab 1

        Then I should see 1 visible tabs on the workspace "pinned-tabs"
        And I should see 2 visible tabs on the workspace "opened-tabs"

        When I close the tab 0

        Then I should see 0 visible tab on the workspace "pinned-tabs"
        And I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
