@settingsTabCloseButtonHover
Feature: Settings - Tab close button on hover
    Scenario: Tab close button on hover setting should be checked by default
        Given I use the settings UI

        Then the tab close button on hover setting should be checked

    Scenario: Tab close button should be shown on hover
        Given I use the small UI

        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I hover the tab 1 on the tab list "opened-tabs"

        Then there should be a visible close button on the tab 1 on the tab list "opened-tabs"

    Scenario: Pinned tab close button should not be shown on hover
        Given I use the small UI

        When I open the test page "test-page1"
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I hover the tab 0 on the tab list "pinned-tabs"

        Then there should not be a visible close button on the tab 0 on the tab list "pinned-tabs"

    Scenario: Uncheck tab close button on hover setting should prevent the tab close button to be shown on hover
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should not be checked

        When I focus the small UI
        And I hover the tab 1 on the tab list "opened-tabs"

        Then there should not be a visible close button on the tab 1 on the tab list "opened-tabs"

        When I open the test page "test-page2"
        And I hover the tab 3 on the tab list "opened-tabs"

        Then there should not be a visible close button on the tab 3 on the tab list "opened-tabs"

    Scenario: Check tab close button on hover setting should allow the tab close button to be shown on hover
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should not be checked

        When I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should be checked

        When I focus the small UI
        And I hover the tab 1 on the tab list "opened-tabs"

        Then there should be a visible close button on the tab 1 on the tab list "opened-tabs"

        When I open the test page "test-page2"
        And I hover the tab 3 on the tab list "opened-tabs"

        Then there should be a visible close button on the tab 3 on the tab list "opened-tabs"

    Scenario: Check tab close button on hover setting should prevent the pinned tab close button to be shown on hover
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 1 visible tabs on the tab list "pinned-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should not be checked

        When I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should be checked

        When I focus the small UI
        And I hover the tab 0 on the tab list "pinned-tabs"

        Then there should not be a visible close button on the tab 0 on the tab list "pinned-tabs"

        When I open the test page "test-page2"
        And I pin the tab 3
        And I hover the tab 1 on the tab list "pinned-tabs"

        Then there should not be a visible close button on the tab 1 on the tab list "pinned-tabs"

    Scenario: Tab close button on hover setting should be checked at startup
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should not be checked

        When I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should be checked

        When I reload the tab 0

        Then the tab close button on hover setting should be checked

    Scenario: Tab close button on hover setting should be unchecked at startup
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should not be checked

        When I reload the tab 0

        Then the tab close button on hover setting should not be checked

    Scenario: Tab close button on hover setting should be checked on another instance of the settings page
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I open the settings UI
        And I click on the checkbox of the tab close button on hover setting

        Then the tab close button on hover setting should not be checked

        When I click on the checkbox of the tab close button on hover setting
        And I focus the tab 1

        Then the tab close button on hover setting should be checked

    Scenario: Tab close button on hover setting should be unchecked on another instance of the settings page
        Given I use the settings UI
        And the tab close button on hover setting should be checked

        When I open the settings UI
        And I click on the checkbox of the tab close button on hover setting
        And I focus the tab 1

        Then the tab close button on hover setting should not be checked
