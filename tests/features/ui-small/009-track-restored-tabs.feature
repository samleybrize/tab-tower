@trackRestoredTabs
Feature: Track restored tabs

    Background:
        Given I use the small UI

    Scenario: Restored tabs should appear in the opened tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I close the tab 1

        Then I should see 2 visible tabs on the workspace "opened-tabs"

        When I restore the last recently closed tab

        Then I should see 3 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should see the current workspace with label "All opened tabs" and 3 tabs indicated

        When I reload the tab 0

        Then I should see 3 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should see the current workspace with label "All opened tabs" and 3 tabs indicated

    Scenario: Restored pinned tabs should appear in the opened tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I pin the tab 1
        And I pin the tab 2
        And I close the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 1 visible tabs on the workspace "pinned-tabs"

        When I restore the last recently closed tab

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 2 visible tabs on the workspace "pinned-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should see the current workspace with label "All opened tabs" and 4 tabs indicated

        When I reload the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 2 visible tabs on the workspace "pinned-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should see the current workspace with label "All opened tabs" and 4 tabs indicated

    Scenario: Restoring a tab after moving other tabs should appear in the opened tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I close the tab 2

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I move the tab 1 to position 2
        And I restore the last recently closed tab

        Then I should see 4 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"

        When I reload the tab 0

        Then I should see 4 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"

    Scenario: Restoring a tab after moving other tabs and reloading the UI should appear in the opened tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I close the tab 2

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I move the tab 1 to position 2
        And I reload the tab 0
        And I restore the last recently closed tab

        Then I should see 4 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"
        And I should see the current workspace with label "All opened tabs" and 4 tabs indicated

        When I reload the tab 0

        Then I should see 4 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"
        And I should see the current workspace with label "All opened tabs" and 4 tabs indicated
