@settingsTabAddress
Feature: Settings - Tab url
    Scenario: The show tab url setting should be set to "domain only" by default
        Given I use the settings UI

        Then the show tab url setting should be set to "domain only"

    Scenario: Tab url domain should be shown on unpinned tabs
        Given I use the small UI

        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the url domain of the tab 1 on the workspace "opened-tabs"
        And I should not see the url of the tab 1 on the workspace "opened-tabs"

    Scenario: Tab url domain should be shown on pinned tabs
        Given I use the small UI

        When I open the test page "test-page1"
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And I should not see the url domain of the tab 0 on the workspace "pinned-tabs"
        And I should not see the url of the tab 0 on the workspace "pinned-tabs"

    Scenario: Tab url should be shown on unpinned tabs when the show tab url setting is set to "yes"
        Given I use the settings UI

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I focus the settings UI
        And I set the show tab url setting to "yes"
        And I focus the small UI

        Then I should not see the url domain of the tab 1 on the workspace "opened-tabs"
        And I should see the url of the tab 1 on the workspace "opened-tabs"

    Scenario: Tab url should be shown on pinned tabs when the show tab url setting is set to "yes"
        Given I use the settings UI

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 1 visible tabs on the workspace "pinned-tabs"

        When I focus the settings UI
        And I set the show tab url setting to "yes"
        And I focus the small UI

        Then I should not see the url domain of the tab 0 on the workspace "pinned-tabs"
        And I should not see the url of the tab 0 on the workspace "pinned-tabs"

    Scenario: Tab url domain should be shown on unpinned tabs when the show tab url setting is set to "domain only"
        Given I use the settings UI

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I focus the settings UI
        And I set the show tab url setting to "yes"
        And I set the show tab url setting to "domain only"
        And I focus the small UI

        Then I should see the url domain of the tab 1 on the workspace "opened-tabs"
        And I should not see the url of the tab 1 on the workspace "opened-tabs"

    Scenario: Tab url domain should be shown on pinned tabs when the show tab url setting is set to "domain only"
        Given I use the settings UI

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 1 visible tabs on the workspace "pinned-tabs"

        When I focus the settings UI
        And I set the show tab url setting to "yes"
        And I set the show tab url setting to "domain only"
        And I focus the small UI

        Then I should not see the url domain of the tab 0 on the workspace "pinned-tabs"
        And I should not see the url of the tab 0 on the workspace "pinned-tabs"

    Scenario: No tab url should be shown on unpinned tabs when the show tab url setting is set to "no"
        Given I use the settings UI

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I focus the settings UI
        And I set the show tab url setting to "no"
        And I focus the small UI

        Then I should not see the url domain of the tab 1 on the workspace "opened-tabs"
        And I should not see the url of the tab 1 on the workspace "opened-tabs"

    Scenario: No tab url should be shown on pinned tabs when the show tab url setting is set to "no"
        Given I use the settings UI

        When I open the test page "test-page1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 1 visible tabs on the workspace "pinned-tabs"

        When I focus the settings UI
        And I set the show tab url setting to "no"
        And I focus the small UI

        Then I should not see the url domain of the tab 0 on the workspace "pinned-tabs"
        And I should not see the url of the tab 0 on the workspace "pinned-tabs"

    Scenario: Show tab url setting should be set to "yes" at startup
        Given I use the settings UI

        When I set the show tab url setting to "yes"

        Then the show tab url setting should be set to "yes"

        When I reload the tab 0

        Then the show tab url setting should be set to "yes"

    Scenario: Show tab url setting should be set to "domain only" at startup
        Given I use the settings UI

        When I set the show tab url setting to "yes"
        And I set the show tab url setting to "domain only"

        Then the show tab url setting should be set to "domain only"

        When I reload the tab 0

        Then the show tab url setting should be set to "domain only"

    Scenario: Show tab url setting should be set to "no" at startup
        Given I use the settings UI

        When I set the show tab url setting to "no"

        Then the show tab url setting should be set to "no"

        When I reload the tab 0

        Then the show tab url setting should be set to "no"

    Scenario: Show tab url setting should be set to "yes" on another instance of the settings page
        Given I use the settings UI

        When I open the settings UI
        And I set the show tab url setting to "yes"
        And I focus the tab 1

        Then the show tab url setting should be set to "yes"

    Scenario: Show tab url setting should be set to "domain only" on another instance of the settings page
        Given I use the settings UI

        When I open the settings UI
        And I set the show tab url setting to "yes"
        And I set the show tab url setting to "domain only"
        And I focus the tab 1

        Then the show tab url setting should be set to "domain only"

    Scenario: Show tab url setting should be set to "no" on another instance of the settings page
        Given I use the settings UI

        When I open the settings UI
        And I set the show tab url setting to "no"
        And I focus the tab 1

        Then the show tab url setting should be set to "no"
