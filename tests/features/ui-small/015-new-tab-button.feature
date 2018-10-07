@newTabButton
Feature: New tab button
    Background:
        Given I use the small UI

    Scenario: A click on the new tab button should open a new empty tab
        When I click on the new tab button

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the browser's tab 1 as focused
        And I should see the url "about:newtab" on the tab 1 of the tab list "opened-tabs"
        And I should see the url domain "about:newtab" on the tab 1 of the tab list "opened-tabs"
