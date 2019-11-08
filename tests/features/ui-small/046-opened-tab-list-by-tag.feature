@openedTabListByTag
Feature: Opened Tab List - By Tag

    Background:
        Given I use the small UI

        When I click on the "go to sidenav" button

        And I click on the sidenav "add tag" button
        And I type "label one" in the tag label input
        And I click on the tag save button

        And I click on the sidenav "add tag" button
        And I type "label two" in the tag label input
        And I click on the tag save button

        And I click on the sidenav back button
        And I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the tab context menu manage tags button of the tab 2 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tag 1 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab context menu manage tags button of the tab 3 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

    Scenario: "All opened tabs" should be active by default
        When I click on the "go to sidenav" button

        Then I should see that "all opened tabs" is marked as active on the sidenav

    Scenario: Should show only unpinned tabs that have the selected tag
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"

        When I click on the "go to sidenav" button

        Then I should see that the tag 0 is marked as active on the sidenav

        When I reload the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"

        When I click on the "go to sidenav" button

        Then I should see that the tag 0 is marked as active on the sidenav

    Scenario: Should show all pinned tabs when a tag is selected
        When I pin the tab 1
        And I click on the "go to sidenav" button
        And I click on the tag 1 on the sidenav

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"

        When I click on the "go to sidenav" button

        Then I should see that the tag 1 is marked as active on the sidenav

        When I reload the tab 1

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"

        When I click on the "go to sidenav" button

        Then I should see that the tag 1 is marked as active on the sidenav

    Scenario: Should show all opened tabs when "All opened tabs" is clicked
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav

        Then I should see 4 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should see 4 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "opened-tabs"

        When I click on the "go to sidenav" button

        Then I should see that "all opened tabs" is marked as active on the sidenav

    Scenario: A new opened tab should not be shown when a tag is selected
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I open the small UI
        And I use the tab 4
        And I click on the "go to sidenav" button

        Then I should see that the tag 0 is marked as active on the sidenav

        When I click on "all opened tabs" on the sidenav

        Then I should see 5 visible tabs on the tab list "opened-tabs"

        When I use the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"

    Scenario: A tab that do not have the selected tag should be shown when the tag is added to it
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I open the small UI
        And I use the tab 4
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I use the tab 0

        Then I should see 3 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the tab list "opened-tabs"

    Scenario: A newly opened tab should inherit tags from its parent tab
        When I click on the "go to sidenav" button
        And I click on the tag 1 on the sidenav

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I use the tab 2
        And I click on the link 0
        And I focus the small UI

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the tag 1 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 1 on the tab list "opened-tabs"

    Scenario: Should show all opened tabs when "All opened tabs" is clicked after selecting a tab
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav
        And I open the test page "test-filter-with-some-text"

        Then I should see 5 visible tabs on the tab list "opened-tabs"

    Scenario: A tab that do not have the selected tag should be shown when pinned
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I pin the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        Then I should see 1 visible tab on the tab list "pinned-tabs"

        When I unpin the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        Then I should see 0 visible tab on the tab list "pinned-tabs"

    Scenario: A restored tab that have the selected tag should be shown
        When I close the tab 2
        And I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I restore the last recently closed tab

        Then I should see 2 visible tabs on the tab list "opened-tabs"

    Scenario: A restored tab that do not have the selected tag should not be shown
        When I close the tab 1
        And I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I restore the last recently closed tab
        And I open the small UI
        And I use the tab 4
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav

        Then I should see 5 visible tabs on the tab list "opened-tabs"

        When I use the tab 0

        Then I should see 2 visible tabs on the tab list "opened-tabs"

    Scenario: A restored tab that have a deleted tag should not raise an error
        When I close the tab 2

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the tag context menu delete button of the tag 0 on the sidenav
        And I click on the yes button on the tag 0 delete confirmation box on the sidenav

        Then I should see 1 visible tag in the sidenav

        When I click on the sidenav back button
        And I restore the last recently closed tab

        Then I should see 4 visible tabs on the tab list "opened-tabs"

    Scenario: Should remove a closed tab
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I close the tab 2

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the tab list "opened-tabs"

    Scenario: Should show the total number of tabs that have the selected tag
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I click on the "go to sidenav" button
        And I click on the tag 1 on the sidenav

        Then I should see the current tab list with label "label two" and 1 tab indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label two" and 1 tab indicated

    Scenario: Should show the total number of tabs that have the selected tag when a pinned tab have the selected tag
        When I pin the tab 2
        And I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: Should show the total number of tabs that have the selected tag when a pinned tab does not have the selected tag
        When I pin the tab 1
        And I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: Should update the total number of tabs that have the selected tag when a matching tab is closed
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I close the tab 2

        Then I should see the current tab list with label "label one" and 1 tab indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 1 tab indicated

    Scenario: Should not update the total number of tabs that have the selected tag when a non-matching tab is closed
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I close the tab 1

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: Should not update the total number of tabs that have the selected tag when a matching tab is pinned
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I pin the tab 2

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: Should not update the total number of tabs that have the selected tag when a non-matching tab is pinned
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I pin the tab 1

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: Should update the total number of tabs that have the selected tag when the tag is added to a tab
        When I click on the "go to sidenav" button
        And I click on the tag 1 on the sidenav

        Then I should see the current tab list with label "label two" and 1 tab indicated

        When I open the small UI
        And I use the tab 4
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav

        Then I should not see the sidenav

        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 1 checkbox in the tab tag management view
        And I use the tab 0

        Then I should see the current tab list with label "label two" and 2 tabs indicated

    Scenario: Should update the total number of tabs that have the selected tag when a tab that have the tag is restored
        When I close the tab 2
        And I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 1 tab indicated

        When I restore the last recently closed tab

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: Should not update the total number of tabs that have the selected tag when a non-matching tab is opened
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I open the test page "test-page1"

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I reload the tab 0

        Then I should see the current tab list with label "label one" and 2 tabs indicated

    Scenario: All tabs should be unselected when a tag is selected
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav
        And I click on the "go to sidenav" button
        And I click on "all opened tabs" on the sidenav

        Then I should not see the tab 0 as selected on the tab list "opened-tabs"
        And I should not see the tab 1 as selected on the tab list "opened-tabs"
        And I should not see the tab 2 as selected on the tab list "opened-tabs"
        And I should not see the tab 3 as selected on the tab list "opened-tabs"

    Scenario: "All opened tabs" should be active when the selected tag is deleted
        When I click on the "go to sidenav" button
        And I click on the tag 0 on the sidenav

        Then I should see the current tab list with label "label one" and 2 tabs indicated

        When I click on the "go to sidenav" button
        And I click on the tag context menu delete button of the tag 0 on the sidenav
        And I click on the yes button on the tag 0 delete confirmation box on the sidenav
        And I click on the sidenav back button

        Then I should see the current tab list with label "All opened tabs" and 4 tabs indicated
        And I should see 4 visible tabs on the tab list "opened-tabs"
