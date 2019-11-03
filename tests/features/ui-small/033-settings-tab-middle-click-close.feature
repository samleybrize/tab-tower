@settingsTabMiddleClickClose
Feature: Settings - Tab middle click close
    Scenario: Tab middle click close setting should be checked by default
        Given I use the settings UI

        Then the tab middle click close setting should be checked

    Scenario: A middle click on a tab should close it
        Given I use the small UI

        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I middle click on the tab 1 on the tab list "opened-tabs"

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"

    Scenario: A middle click on a pinned tab should close it
        Given I use the small UI

        When I open the test page "test-page1"
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I middle click on the tab 0 on the tab list "pinned-tabs"

        Then I should see 0 visible tab on the tab list "pinned-tabs"
        And I should see 1 visible tab on the tab list "opened-tabs"

    Scenario: Uncheck tab middle click close setting should disable tab middle click close
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        When I focus the small UI
        And I middle click on the tab 1 on the tab list "opened-tabs"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I open the test page "test-page2"
        And I middle click on the tab 3 on the tab list "opened-tabs"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

    Scenario: Uncheck tab middle click close setting should disable pinned tab middle click close
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        When I focus the small UI
        And I middle click on the tab 0 on the tab list "pinned-tabs"

        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I open the test page "test-page2"
        And I pin the tab 3
        And I middle click on the tab 1 on the tab list "pinned-tabs"

        Then I should see 2 visible tabs on the tab list "pinned-tabs"

    Scenario: Check tab middle click close setting should enable tab middle click close
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        When I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should be checked

        When I focus the small UI
        And I middle click on the tab 1 on the tab list "opened-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I open the test page "test-page2"
        And I middle click on the tab 2 on the tab list "opened-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"

    Scenario: Check tab middle click close setting should enable pinned tab middle click close
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"

        When I focus the settings UI
        And I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        When I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should be checked

        When I focus the small UI
        And I middle click on the tab 0 on the tab list "pinned-tabs"

        Then I should see 0 visible tab on the tab list "pinned-tabs"

        When I open the test page "test-page2"
        And I pin the tab 2
        And I middle click on the tab 0 on the tab list "pinned-tabs"

        Then I should see 0 visible tab on the tab list "pinned-tabs"

    Scenario: Tab middle click close setting should be checked at startup
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        And I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should be checked

        When I reload the tab 0

        Then the tab middle click close setting should be checked

    Scenario: Tab middle click close setting should be unchecked at startup
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        When I reload the tab 0

        Then the tab middle click close setting should not be checked

    Scenario: Tab middle click close setting should be checked on another instance of the settings page
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I open the settings UI
        And I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should not be checked

        When I click on the checkbox of the tab middle click close setting

        Then the tab middle click close setting should be checked

        When I focus the tab 1

        Then the tab middle click close setting should be checked

    Scenario: Tab middle click close setting should be unchecked on another instance of the settings page
        Given I use the settings UI
        And the tab middle click close setting should be checked

        When I open the settings UI
        And I click on the checkbox of the tab middle click close setting
        And I focus the tab 1

        Then the tab middle click close setting should not be checked
