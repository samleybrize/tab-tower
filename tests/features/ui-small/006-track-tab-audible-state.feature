@trackTabAudibleState
Feature: Track tab audible state

    Background:
        Given I use the small UI

    Scenario: Audible tabs should be indicated as audible in the opened tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-with-sound" as tab 1 on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should not see the tab 1 as muted on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-with-sound" as tab 1 on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should not see the tab 1 as muted on the tab list "opened-tabs"

    Scenario: Audible tabs should be indicated as audible in the pinned tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-with-sound" as tab 0 on the tab list "pinned-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 0 as audible on the tab list "pinned-tabs"
        And I should not see the tab 0 as muted on the tab list "pinned-tabs"

        When I reload the tab 0

        Then I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-with-sound" as tab 0 on the tab list "pinned-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 0 as audible on the tab list "pinned-tabs"
        And I should not see the tab 0 as muted on the tab list "pinned-tabs"

    Scenario: Muted tabs should be indicated as muted in the opened tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I mute the tab 1

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 1 as audible on the tab list "opened-tabs"
        And I should see the tab 1 as muted on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 1 as audible on the tab list "opened-tabs"
        And I should see the tab 1 as muted on the tab list "opened-tabs"

        When I unmute the tab 1

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should not see the tab 1 as muted on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should not see the tab 1 as muted on the tab list "opened-tabs"

    Scenario: Muted tabs should be indicated as muted in the pinned tabs list
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I mute the tab 0

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "pinned-tabs"
        And I should see the tab 0 as muted on the tab list "pinned-tabs"

        When I reload the tab 0

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "pinned-tabs"
        And I should see the tab 0 as muted on the tab list "pinned-tabs"

        When I unmute the tab 0

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 0 as audible on the tab list "pinned-tabs"
        And I should not see the tab 0 as muted on the tab list "pinned-tabs"

        When I reload the tab 0

        Then I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 0 as audible on the tab list "pinned-tabs"
        And I should not see the tab 0 as muted on the tab list "pinned-tabs"

    Scenario: Audible state of the sticky focused tab should be in sync with the one of its corresponding tab
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see the tab 1 as audible on the tab list "opened-tabs"

        When I focus the tab 1

        Then I should see the sticky focused tab as audible
        And I should not see the sticky focused tab as muted

        When I reload the tab 0

        Then I should see the sticky focused tab as audible
        And I should not see the sticky focused tab as muted

    Scenario: Audio Muted state of the sticky focused tab should be in sync with the one of its corresponding tab
        When I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 0
        And I mute the tab 1

        Then I should see the tab 1 as muted on the tab list "opened-tabs"

        When I focus the tab 1

        Then I should not see the sticky focused tab as audible
        And I should see the sticky focused tab as muted

        When I reload the tab 0

        Then I should not see the sticky focused tab as audible
        And I should see the sticky focused tab as muted

        When I focus the tab 0
        And I unmute the tab 1

        Then I should not see the tab 1 as muted on the tab list "opened-tabs"

        When I focus the tab 1

        Then I should see the sticky focused tab as audible
        And I should not see the sticky focused tab as muted

        When I reload the tab 0
        And I focus the tab 0
        And I focus the tab 1

        Then I should see the sticky focused tab as audible
        And I should not see the sticky focused tab as muted
