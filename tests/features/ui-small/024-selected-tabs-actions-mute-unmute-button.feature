@selectedTabsActionsMuteButton
Feature: Selected tabs actions - Mute and Unmute button
    Background:
        Given I use the small UI

        When I open the test page "test-with-sound"
        And I open the test page "test-with-sound"
        And I focus the tab 1
        And I focus the tab 2
        And I focus the tab 0

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should see the tab 2 as audible on the tab list "opened-tabs"

    Scenario: Clicking on the selected tabs actions mute button should mute selected tabs
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions mute button

        Then I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as muted on the tab list "opened-tabs"
        And I should see the tab 2 as muted on the tab list "opened-tabs"
        And the selected tabs actions context menu should not be visible

    Scenario: Clicking on the selected tabs actions unmute button should unmute selected tabs
        When I mute the tab 1
        And I mute the tab 2

        Then I should see the tab 1 as muted on the tab list "opened-tabs"
        And I should see the tab 2 as muted on the tab list "opened-tabs"

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions unmute button

        Then I should not see the tab 0 as muted on the tab list "opened-tabs"
        And I should not see the tab 0 as audible on the tab list "opened-tabs"
        And I should not see the tab 1 as muted on the tab list "opened-tabs"
        And I should see the tab 1 as audible on the tab list "opened-tabs"
        And I should not see the tab 2 as muted on the tab list "opened-tabs"
        And I should see the tab 2 as audible on the tab list "opened-tabs"
        And the selected tabs actions context menu should not be visible
