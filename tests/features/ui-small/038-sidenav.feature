@sidenav
Feature: Sidenav

    Background:
        Given I use the small UI

    Scenario: Clicking on the sidenav button should show the sidenav
        When I click on the "go to sidenav" button

        Then I should see the sidenav

    Scenario: Clicking on the settings button should open the settings page
        When I click on the "go to sidenav" button
        And I click on the settings button in the sidenav

        Then I should see the settings page on the tab 1

    Scenario: Clicking on the back button should hide the sidenav
        When I click on the "go to sidenav" button
        And I click on the sidenav back button

        Then I should not see the sidenav
