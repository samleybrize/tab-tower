Feature: Track tab opening

    Background:
        Given I use the small UI

    Scenario: Opened tabs should appear in the opened tabs list
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "opened-tabs"
