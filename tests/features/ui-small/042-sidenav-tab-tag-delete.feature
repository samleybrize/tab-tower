@sidenavTabTagDelete
Feature: Sidenav - Tab tag delete

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

    Scenario: Clicking on the context menu delete button should open the delete confirmation dialog
        When I click on the tag context menu delete button of the tag 1 on the sidenav

        Then I should see the tag 1 delete confirmation box on the sidenav

    Scenario: Clicking on the yes button should delete a tab tag
        When I click on the tag context menu delete button of the tag 0 on the sidenav
        And I click on the yes button on the tag 0 delete confirmation box on the sidenav

        Then I should see 1 visible tag in the sidenav
        And I should see the tag 0 with the label "Yellow" in the sidenav
        And I should see the tag 0 with the color 3 in the sidenav
        And I should not see the tag 0 delete confirmation box on the sidenav

    Scenario: Clicking on the no button should not delete a tab tag
        When I click on the tag context menu delete button of the tag 0 on the sidenav
        And I click on the no button on the tag 0 delete confirmation box on the sidenav

        Then I should see 2 visible tags in the sidenav
        And I should see the tag 0 with the label "qwerty" in the sidenav
        And I should see the tag 0 with the color 0 in the sidenav
        And I should see the tag 1 with the label "Yellow" in the sidenav
        And I should see the tag 1 with the color 3 in the sidenav
        And I should not see the tag 0 delete confirmation box on the sidenav
