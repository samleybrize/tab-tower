@openedTabListTagManagementFilter
Feature: Opened Tab List - Tag Management Filter

    Background:
        Given I use the small UI

        When I click on the "go to sidenav" button

        And I click on the sidenav "add tag" button
        And I type "the azerty label" in the tag label input
        And I click on the tag save button

        And I click on the sidenav "add tag" button
        And I type "label one" in the tag label input
        And I click on the tag save button

        And I click on the sidenav "add tag" button
        And I type "label two" in the tag label input
        And I click on the tag save button

        And I click on the sidenav "add tag" button
        And I type "the qwerty label" in the tag label input
        And I select the color 3 on the tag form
        And I click on the tag save button

        And I click on the sidenav back button
        And I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then I should not see that no tag matches tag search on the tab tag assignment view

    Scenario: Should filter tab tags by label on input with one word
        When I type "azerty" in the tag filter input on the tab tag assignment view

        Then I should see 1 visible tag in the tab tag assignment view
        And I should see the tag 0 with the label "the azerty label" in the tab tag assignment view
        And I should not see that no tag matches tag search on the tab tag assignment view

    Scenario: Should filter tab tags by label on input with two word
        When I type "azerty qwerty" in the tag filter input on the tab tag assignment view

        Then I should see 2 visible tags in the tab tag assignment view
        And I should see the tag 0 with the label "the azerty label" in the tab tag assignment view
        And I should see the tag 1 with the label "the qwerty label" in the tab tag assignment view
        And I should not see that no tag matches tag search on the tab tag assignment view

    Scenario: Should show the no tag row in tab tags list when the filter do not match any tag
        When I type "unknown" in the tag filter input on the tab tag assignment view

        Then I should see 0 visible tag in the tab tag assignment view
        And I should see that no tag matches tag search on the tab tag assignment view

        When I delete all characters in the tag filter input on the tab tag assignment view

        Then I should not see that no tag matches tag search on the tab tag assignment view

    Scenario: Should show all tab tags when clearing the input
        When I type "azerty" in the tag filter input on the tab tag assignment view

        Then I should see 1 visible tag in the tab tag assignment view

        When I delete all characters in the tag filter input on the tab tag assignment view

        Then I should see 4 visible tags in the tab tag assignment view
        And I should see the tag 0 with the label "label one" in the tab tag assignment view
        And I should see the tag 1 with the label "label two" in the tab tag assignment view
        And I should see the tag 2 with the label "the azerty label" in the tab tag assignment view
        And I should see the tag 3 with the label "the qwerty label" in the tab tag assignment view
        And I should not see that no tag matches tag search on the tab tag assignment view

    Scenario: Should filter tab tags at startup when the input is not empty
        When I type "azerty" in the tag filter input on the tab tag assignment view

        Then I should see 1 visible tag in the tab tag assignment view

        When I reload the tab 0

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then I should see 1 visible tag in the tab tag assignment view
        And I should see the tag 0 with the label "the azerty label" in the tab tag assignment view
        And I should not see that no tag matches tag search on the tab tag assignment view

    Scenario: Should apply filter on new tags
        When I type "azerty" in the tag filter input on the tab tag assignment view

        And I click on the tab tag assignment view "add tag" button
        And I type "not matching" in the tag label input
        And I click on the tag save button

        And I click on the tab tag assignment view "add tag" button
        And I type "matching azerty" in the tag label input
        And I click on the tag save button

        Then I should see 2 visible tags in the tab tag assignment view
        And I should see the tag 0 with the label "matching azerty" in the tab tag assignment view
        And I should see the tag 1 with the label "the azerty label" in the tab tag assignment view

    Scenario: Should update shown tags when their label change
        When I type "azerty" in the tag filter input on the tab tag assignment view
        And I open the small UI
        And I use the tab 3

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the "go to sidenav" button
        And I click on the tag context menu edit button of the tag 2 on the sidenav
        And I type "not matching" in the tag label input
        And I click on the tag save button

        Then I should not see the edit tag form

        When I click on the tag context menu edit button of the tag 0 on the sidenav
        And I type "matching azerty" in the tag label input
        And I click on the tag save button

        And I use the tab 0

        Then I should see 1 visible tag in the tab tag assignment view
        And I should see the tag 0 with the label "matching azerty" in the tab tag assignment view
