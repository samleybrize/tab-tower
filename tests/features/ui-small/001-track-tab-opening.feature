@trackTabOpening
Feature: Track tab opening

    Background:
        Given I use the small UI

    Scenario: Opened tabs should appear in the opened tabs list
        When I open the test page "test-page1"
        And I open the test page "test-page-with-not-found-favicon"
        And I open the test page "test-page-without-favicon"
        And I open the test page "test-page-with-favicon-401"
        And I open an empty tab

        Then I should see 6 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page-with-not-found-favicon" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page-without-favicon" as tab 3 on the workspace "opened-tabs"
        And I should see the test page "test-page-with-favicon-401" as tab 4 on the workspace "opened-tabs"
        And I should see the current workspace with label "All opened tabs" and 6 tabs indicated

        And I should see the url "about:newtab" on the tab 5 of the workspace "opened-tabs"
        And I should see the url domain "about:newtab" on the tab 5 of the workspace "opened-tabs"
