@sidenavTabTagCreate
Feature: Sidenav - Tab tag create

    Background:
        Given I use the small UI

        When I click on the "go to sidenav" button
        And I click on the sidenav "add tag" button

    Scenario: Clicking on "add tag" should open the create tag form
        Then I should see the create tag form
        And the tag label input should be focused
        And the tag label input should be empty
        And the tag label input should not be marked as invalid

    Scenario: Clicking on the save button should create a new tag with the default tag color
        When I type "azerty" in the tag label input
        And I click on the tag save button

        Then I should not see the create tag form
        And I should see 1 visible tag in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 0 in the sidenav

        When I reload the tab 0
        And I click on the "go to sidenav" button

        Then I should see 1 visible tag in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 0 in the sidenav

    Scenario: Clicking on the save button with the yellow color selected should create a new tag with the yellow tag color
        When I type "azerty" in the tag label input
        And I select the color 3 on the tag form
        And I click on the tag save button

        Then I should not see the create tag form
        And I should see 1 visible tag in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav

        When I reload the tab 0
        And I click on the "go to sidenav" button

        Then I should see 1 visible tag in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav

    Scenario: Creating several tags should add them in alphabetical order
        When I type "zoo" in the tag label input
        And I click on the tag save button
        And I click on the sidenav "add tag" button
        And I type "azerty" in the tag label input
        And I select the color 3 on the tag form
        And I click on the tag save button
        And I click on the sidenav "add tag" button
        And I type "Banana" in the tag label input
        And I select the color 5 on the tag form
        And I click on the tag save button

        Then I should see 3 visible tags in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav
        And I should see the tag 1 with the label "Banana" in the sidenav
        And I should see the tag 1 with the color 5 in the sidenav
        And I should see the tag 2 with the label "zoo" in the sidenav
        And I should see the tag 2 with the color 0 in the sidenav

        When I reload the tab 0
        And I click on the "go to sidenav" button

        Then I should see 3 visible tags in the sidenav
        And I should see the tag 0 with the label "azerty" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav
        And I should see the tag 1 with the label "Banana" in the sidenav
        And I should see the tag 1 with the color 5 in the sidenav
        And I should see the tag 2 with the label "zoo" in the sidenav
        And I should see the tag 2 with the color 0 in the sidenav

    Scenario: Clicking on the save button with an empty label should not create a tag
        Then I should see the create tag form

        When I click on the tag save button

        Then I should see the create tag form
        And the tag label input should be marked as invalid
        And I should see 0 visible tag in the sidenav

    Scenario: Clicking on the back button should not create a tag
        Then I should see the create tag form

        When I click on the tab tag form back button

        Then I should not see the create tag form
        And I should see 0 visible tag in the sidenav
