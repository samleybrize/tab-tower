@settingsMultilineUrl
Feature: Settings - Multiline url
    Background:
        Given I use the settings UI
        And I set the show tab url setting to "yes"

    Scenario: The show tab url on several lines setting should be unchecked by default
        # TODO
        Then the show tab url on several lines setting should not be checked

    Scenario: Tab url should be on one line
        # TODO
        When I open the small UI
        And I focus the small UI
        And I close the tab 0
        And I open the test page "test-page-with-long-title1"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And the url of the tab 1 on the tab list "opened-tabs" should be on one line

    Scenario: Tab url should be on several lines when the show tab url on several lines setting is checked
        # TODO
        When I open the test page "test-page-with-long-title1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the show tab url on several lines setting

        When I focus the small UI

        Then the url of the tab 1 on the tab list "opened-tabs" should be on several lines

        When I open the test page "test-page-with-long-title2"

        Then the url of the tab 3 on the tab list "opened-tabs" should be on several lines

    Scenario: Tab url should be on one line when the show tab url on several lines setting is unchecked
        # TODO
        When I open the test page "test-page-with-long-title1"
        And I open the small UI
        And I focus the small UI

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I focus the settings UI
        And I click on the checkbox of the show tab url on several lines setting
        And I click on the checkbox of the show tab url on several lines setting

        When I focus the small UI

        Then the url of the tab 1 on the tab list "opened-tabs" should be on one line

        When I open the test page "test-page-with-long-title2"

        Then the url of the tab 3 on the tab list "opened-tabs" should be on one line

    Scenario: Show tab url on several lines should be checked at startup
        # TODO
        When I click on the checkbox of the show tab url on several lines setting

        Then the show tab url on several lines setting should be checked

        When I reload the tab 0

        Then the show tab url on several lines setting should be checked

    Scenario: Show tab url on several lines should be unchecked at startup
        # TODO
        When I click on the checkbox of the show tab url on several lines setting
        And I click on the checkbox of the show tab url on several lines setting

        Then the show tab url on several lines setting should not be checked

        When I reload the tab 0

        Then the show tab url on several lines setting should not be checked

    Scenario: Show tab url on several lines should be checked on another instance of the settings page
        # TODO
        When I open the settings UI
        And I click on the checkbox of the show tab url on several lines setting
        And I focus the tab 1

        Then the show tab url on several lines setting should be checked

    Scenario: Show tab url on several lines should be unchecked on another instance of the settings page
        # TODO
        When I open the settings UI
        And I click on the checkbox of the show tab url on several lines setting
        And I click on the checkbox of the show tab url on several lines setting
        And I focus the tab 1

        Then the show tab url on several lines setting should not be checked
