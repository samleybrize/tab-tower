@sidenavTabTagsContextMenu
Feature: Sidenav - Tab tags context menu

    Background:
        Given I use the small UI

        When I click on the "go to sidenav" button
        And I click on the sidenav "add tag" button
        And I type "qwerty" in the tag label input
        And I click on the tag save button
        And I click on the sidenav "add tag" button
        And I type "Yellow" in the tag label input
        And I select the color 3 on the tag form
        And I click on the tag save button

    Scenario: A right click on a tab tag should show the context menu
        When I right click on the tag 1 on the sidenav

        Then the context menu of the tag 0 on the sidenav should not be visible
        And the context menu of the tag 1 on the sidenav should be visible

    Scenario: A click outside of the context menu should hide the context menu
        When I right click on the tag 1 on the sidenav

        Then the context menu of the tag 1 on the sidenav should be visible

        When I click outside of the tag context menu on the sidenav

        Then the context menu of the tag 1 on the sidenav should not be visible

    @TODO
    Scenario: The context menu of a tab tag should be hidden when a tab tag is added
        When I right click on the tag 1 on the sidenav
        And I open the small UI
        And I use the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the sidenav "add tag" button
        And I type "zzz" in the tag label input
        And I click on the tag save button
        And I use the tab 0

        Then the context menu of the tag 1 on the sidenav should not be visible

    Scenario: The context menu of a tab tag should be hidden when any tab tag is removed
        When I right click on the tag 1 on the sidenav
        And I open the small UI
        And I use the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the tag context menu delete button of the tag 0 on the sidenav
        And I click on the yes button on the tag 0 delete confirmation box on the sidenav
        And I use the tab 0

        Then the context menu of the tag 0 on the sidenav should not be visible

    Scenario: The context menu of a tab tag should be hidden when any tab tag is updated
        When I right click on the tag 1 on the sidenav
        And I open the small UI
        And I use the tab 1

        Then I should see 2 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the tag context menu edit button of the tag 1 on the sidenav
        And I type "qwerty2" in the tag label input
        And I click on the tag save button
        And I use the tab 0

        Then the context menu of the tag 1 on the sidenav should not be visible

    Scenario: No element should be clickable when a context menu is opened
        When I right click on the tag 1 on the sidenav

        Then the context menu of the tag 1 on the sidenav should be visible

        When I click outside of the tag context menu on the sidenav

        Then I should see 1 browser tabs

        When I click on the settings button in the sidenav

        Then I should see 2 browser tabs
