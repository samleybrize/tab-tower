@tabMuteButton
Feature: Tab mute and unmute buttons
    Background:
        Given I use the small UI

        When I open the test page "test-with-sound"
        And I open the test page "test-page2"
        And I focus the tab 1
        And I focus the tab 0

        Then I should see 3 visible tabs on the workspace "opened-tabs"
        And I should see the tab 1 as audible on the workspace "opened-tabs"

    Scenario: Clicking on a tab mute button should mute its associated tab
        When I click on the mute button of the tab 1 on the workspace "opened-tabs"

        Then I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 1 as muted on the workspace "opened-tabs"
        And I should not see the tab 2 as muted on the workspace "opened-tabs"

    Scenario: Clicking on a pinned tab mute button should mute its associated tab
        When I pin the tab 1
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "pinned-tabs"

        When I click on the mute button of the tab 0 on the workspace "pinned-tabs"

        Then I should not see the tab 0 as muted on the workspace "opened-tabs"
        And I should see the tab 0 as muted on the workspace "pinned-tabs"
        And I should not see the tab 1 as muted on the workspace "pinned-tabs"

    Scenario: Clicking on a tab unmute button should unmute its associated tab
        When I click on the mute button of the tab 1 on the workspace "opened-tabs"

        Then I should see the tab 1 as muted on the workspace "opened-tabs"

        When I click on the unmute button of the tab 1 on the workspace "opened-tabs"

        Then I should not see the tab 0 as muted on the workspace "opened-tabs"
        Then I should not see the tab 0 as audible on the workspace "opened-tabs"
        Then I should not see the tab 1 as muted on the workspace "opened-tabs"
        Then I should see the tab 1 as audible on the workspace "opened-tabs"
        Then I should not see the tab 2 as muted on the workspace "opened-tabs"
        Then I should not see the tab 2 as audible on the workspace "opened-tabs"

    Scenario: Clicking on a pinned tab unmute button should unmute its associated tab
        When I pin the tab 1
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "pinned-tabs"

        When I click on the mute button of the tab 0 on the workspace "pinned-tabs"

        Then I should see the tab 0 as muted on the workspace "pinned-tabs"

        When I click on the unmute button of the tab 0 on the workspace "pinned-tabs"

        Then I should not see the tab 0 as muted on the workspace "opened-tabs"
        Then I should not see the tab 0 as audible on the workspace "opened-tabs"
        Then I should not see the tab 0 as muted on the workspace "pinned-tabs"
        Then I should see the tab 0 as audible on the workspace "pinned-tabs"
        Then I should not see the tab 1 as muted on the workspace "pinned-tabs"
        Then I should not see the tab 1 as audible on the workspace "pinned-tabs"
