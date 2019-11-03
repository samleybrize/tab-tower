@settingsMultilineTitle
Feature: Settings - Multiline title
    Scenario: The show tab title on several lines setting should be unchecked by default
        Given I use the settings UI

        Then the show tab title on several lines setting should not be checked

    Scenario: Tab title should be on one line
        Given I use the small UI

        When I open the test page "test-page-with-long-title1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And the title of the tab 1 on the tab list "opened-tabs" should be on one line

    Scenario: Pinned tab title should be on one line
        Given I use the small UI

        When I open the test page "test-page-with-long-title1"
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"
        And the title of the tab 0 on the tab list "pinned-tabs" should be on one line

    Scenario: Tab title should be on several lines when the show tab title on several lines setting is checked
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I open the test page "test-page-with-long-title1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I focus the small UI

        Then the title of the tab 1 on the tab list "opened-tabs" should be on several lines

        When I open the test page "test-page-with-long-title2"

        Then the title of the tab 3 on the tab list "opened-tabs" should be on several lines

    Scenario: Pinned tab title should be on one line when the show tab title on several lines setting is checked
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I open the test page "test-page-with-long-title1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I focus the settings UI
        And I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I focus the small UI

        Then the title of the tab 0 on the tab list "pinned-tabs" should be on one line

        When I open the test page "test-page-with-long-title2"
        And I pin the tab 3

        Then the title of the tab 1 on the tab list "pinned-tabs" should be on one line

    Scenario: Tab title should be on one line when the show tab title on several lines setting is unchecked
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I open the test page "test-page-with-long-title1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should not be checked

        When I focus the small UI

        Then the title of the tab 1 on the tab list "opened-tabs" should be on one line

        When I open the test page "test-page-with-long-title2"

        Then the title of the tab 3 on the tab list "opened-tabs" should be on one line

    Scenario: Pinned tab title should be on one line when the show tab title on several lines setting is unchecked
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I open the test page "test-page-with-long-title1"
        And I open the small UI
        And I focus the small UI
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I focus the settings UI
        And I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should not be checked

        When I focus the small UI

        Then the title of the tab 0 on the tab list "pinned-tabs" should be on one line

        When I open the test page "test-page-with-long-title2"
        And I pin the tab 3

        Then the title of the tab 1 on the tab list "pinned-tabs" should be on one line

    Scenario: Show tab title on several lines should be checked at startup
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I reload the tab 0

        Then the show tab title on several lines setting should be checked

    Scenario: Show tab title on several lines should be unchecked at startup
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should not be checked

        When I reload the tab 0

        Then the show tab title on several lines setting should not be checked

    Scenario: Show tab title on several lines should be checked on another instance of the settings page
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I open the settings UI
        And I click on the checkbox of the show tab title on several lines setting
        And I focus the tab 1

        Then the show tab title on several lines setting should be checked

    Scenario: Show tab title on several lines should be unchecked on another instance of the settings page
        Given I use the settings UI
        And the show tab title on several lines setting should not be checked

        When I open the settings UI
        And I click on the checkbox of the show tab title on several lines setting

        Then the show tab title on several lines setting should be checked

        When I click on the checkbox of the show tab title on several lines setting
        And I focus the tab 1

        Then the show tab title on several lines setting should not be checked
