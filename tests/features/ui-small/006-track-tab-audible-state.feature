@trackTabAudibleState
Feature: Track tab audible state

    Background:
        Given I use the small UI

    Scenario: Audible tabs should be indicated as audible in the opened tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-with-sound" as tab 1 on the workspace "opened-tabs"
        And I should not see the tab 0 as audible on the workspace "opened-tabs"
        And I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 1 as audible on the workspace "opened-tabs"
        And I should not see the tab 1 as muted on the workspace "opened-tabs"

    Scenario: Audible tabs should be indicated as audible in the pinned tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-with-sound" as tab 0 on the workspace "pinned-tabs"
        And I should not see the tab 0 as audible on the workspace "opened-tabs"
        And I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 0 as audible on the workspace "pinned-tabs"
        And I should not see the tab 0 as muted on the workspace "pinned-tabs"

    Scenario: Muted tabs should be indicated as muted in the opened tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-with-sound" as tab 1 on the workspace "opened-tabs"

        When I mute the tab 1

        Then I should not see the tab 0 as audible on the workspace "opened-tabs"
        And I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 1 as muted on the workspace "opened-tabs"

        When I unmute the tab 1

        Then I should not see the tab 0 as audible on the workspace "opened-tabs"
        And I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 1 as audible on the workspace "opened-tabs"
        And I should not see the tab 1 as muted on the workspace "opened-tabs"

    Scenario: Muted tabs should be indicated as muted in the pinned tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-with-sound" as tab 0 on the workspace "pinned-tabs"

        When I mute the tab 0

        Then I should not see the tab 0 as audible on the workspace "opened-tabs"
        And I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 0 as muted on the workspace "pinned-tabs"

        When I unmute the tab 0

        Then I should not see the tab 0 as audible on the workspace "opened-tabs"
        And I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 0 as audible on the workspace "pinned-tabs"
        And I should not see the tab 0 as muted on the workspace "pinned-tabs"
