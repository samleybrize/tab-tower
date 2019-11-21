@openedTabListByTagWithFilter
Feature: Opened Tab List - By Tag With Filter

    Background:
        Given I use the small UI

        When I click on the "go to sidenav" button

        And I click on the sidenav "add tag" button
        And I type "label one" in the tag label input
        And I click on the tag save button

        And I click on the sidenav back button
        And I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the tab context menu manage tags button of the tab 2 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab context menu manage tags button of the tab 3 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

    Scenario: Filtering tabs should not show tabs that does not have the selected tag
        When I type "page" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"

    Scenario: Unfiltering tabs should not show tabs that does not have the selected tag
        When I type "page" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I delete all characters in the tab filter input

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"

    Scenario: A tab that match the filter should be shown when the selected tag is added to it
        When I type "page" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I open the small UI
        And I use the tab 4
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav
        And I delete all characters in the tab filter input

        Then I should not see the sidenav

        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I use the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"

    Scenario: A tab that does not match the filter should not be shown when the selected tag is added to it
        When I type "filter" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I open the small UI
        And I use the tab 4
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav
        And I delete all characters in the tab filter input

        Then I should not see the sidenav

        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I use the tab 0

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the tab list "opened-tabs"
