@sidenavTabTagUpdate
Feature: Sidenav - Tab tag update

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

    Scenario: Clicking on the context menu edit button should open the edit tag form
        When I click on the tag context menu edit button of the tag 1 on the sidenav

        Then I should see the edit tag form
        And the tag label input should be focused
        And the tag label input should contain "Yellow"
        And the tag label input should not be marked as invalid

    Scenario: Click on the save button with the default tag color should update a tag with the default tag color
        When I click on the tag context menu edit button of the tag 1 on the sidenav
        And I type "azerty" in the tag label input
        And I select the color 0 on the tag form
        And I click on the tag save button

        Then I should not see the edit tag form
        And I should see 2 visible tags in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 0 in the sidenav
        And I should see the tag 1 with the label "qwerty" in the sidenav
        And I should see the tag 1 with the color 0 in the sidenav

        When I reload the tab 0
        And I click on the "go to sidenav" button

        And I should see 2 visible tags in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 0 in the sidenav
        And I should see the tag 1 with the label "qwerty" in the sidenav
        And I should see the tag 1 with the color 0 in the sidenav

    Scenario: Click on the save button with the yellow color selected should update a tag with the yellow tag color
        When I click on the tag context menu edit button of the tag 0 on the sidenav
        And I type "new Label" in the tag label input
        And I select the color 3 on the tag form
        And I click on the tag save button

        Then I should not see the edit tag form
        And I should see 2 visible tags in the sidenav
        And I should see the tag 0 with the label "new Label" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav
        And I should see the tag 1 with the label "Yellow" in the sidenav
        And I should see the tag 1 with the color 3 in the sidenav

        When I reload the tab 0
        And I click on the "go to sidenav" button

        And I should see 2 visible tags in the sidenav
        And I should see the tag 0 with the label "new Label" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav
        And I should see the tag 1 with the label "Yellow" in the sidenav
        And I should see the tag 1 with the color 3 in the sidenav

    Scenario: Clicking on the save button with an empty label should not edit a tag
        When I click on the tag context menu edit button of the tag 0 on the sidenav
        And I should see the edit tag form

        When I clear the tag label input
        And I click on the tag save button

        Then I should see the edit tag form
        And the tag label input should be marked as invalid
        And I should see the tag 0 with the label "qwerty" in the sidenav

    Scenario: Clicking on the back button should not edit a tag
        When I click on the tag context menu edit button of the tag 0 on the sidenav
        And I should see the edit tag form

        When I type "new Label" in the tag label input
        And I click on the tab tag form back button

        Then I should not see the edit tag form
        And I should see the tag 0 with the label "qwerty" in the sidenav

    Scenario: Clicking on the context menu edit button should not select it
        When I click on the tag context menu edit button of the tag 1 on the sidenav
        And I click on the tab tag form back button
        And I click on the sidenav back button

        Then I should see the current tab list with label "All opened tabs" and 1 tab indicated
