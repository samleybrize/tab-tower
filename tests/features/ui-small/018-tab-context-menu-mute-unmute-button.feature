@tabContextMenuMuteButton
Feature: Tab context menu - Mute and unmute button
    Background:
        Given I use the small UI

        When I open the test page "test-with-sound"
        And I open the test page "test-page2"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"

    Scenario: Clicking on a tab context menu mute button should mute the tab
        When I click on the tab context menu mute button of the tab 1 on the tab list "opened-tabs"

        Then I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as muted on the tab list "opened-tabs"
        And I should not see the tab 2 as muted on the tab list "opened-tabs"
        And I should not see the mute button on the tab context menu of the tab 1 on the tab list "opened-tabs"
        And I should see the unmute button on the tab context menu of the tab 1 on the tab list "opened-tabs"

    Scenario: Clicking on a pinned tab context menu mute button should mute the tab
        When I pin the tab 1
        And I pin the tab 2

        Then I should see 2 visible tabs on the tab list "pinned-tabs"

        When I click on the tab context menu mute button of the tab 0 on the tab list "pinned-tabs"

        Then I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 0 as muted on the tab list "pinned-tabs"
        And I should not see the tab 1 as muted on the tab list "pinned-tabs"
        And I should not see the mute button on the tab context menu of the tab 0 on the tab list "pinned-tabs"
        And I should see the unmute button on the tab context menu of the tab 0 on the tab list "pinned-tabs"

    Scenario: Clicking on a tab context menu unmute button should unmute the tab
        When I mute the tab 1

        Then I should see the tab 1 as muted on the tab list "opened-tabs"

        When I click on the tab context menu unmute button of the tab 1 on the tab list "opened-tabs"

        Then I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 1 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should not see the tab 2 as muted on the tab list "opened-tabs"
        And I should not see the tab 2 as audible on the tab list "opened-tabs"
        And I should see the mute button on the tab context menu of the tab 1 on the tab list "opened-tabs"
        And I should not see the unmute button on the tab context menu of the tab 1 on the tab list "opened-tabs"

    Scenario: Clicking on a pinned tab context menu unmute button should unmute the tab
        When I pin the tab 1
        And I pin the tab 2

        Then I should see 2 visible tabs on the tab list "pinned-tabs"

        When I mute the tab 0

        Then I should see the tab 0 as muted on the tab list "pinned-tabs"

        When I click on the tab context menu unmute button of the tab 0 on the tab list "pinned-tabs"

        Then I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 0 as muted on the tab list "pinned-tabs"
        And I should see the tab 0 as audible on the tab list "pinned-tabs"
        And I should not see the tab 1 as muted on the tab list "pinned-tabs"
        And I should not see the tab 1 as audible on the tab list "pinned-tabs"
        And I should see the mute button on the tab context menu of the tab 0 on the tab list "pinned-tabs"
        And I should not see the unmute button on the tab context menu of the tab 0 on the tab list "pinned-tabs"
