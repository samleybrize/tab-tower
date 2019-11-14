@openedTabListTagManagement
Feature: Opened Tab List - Tag Management

    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I click on the "go to sidenav" button

        And I click on the sidenav "add tag" button
        And I type "qwerty" in the tag label input
        And I click on the tag save button

        And I click on the sidenav "add tag" button
        And I type "Yellow" in the tag label input
        And I select the color 3 on the tag form
        And I click on the tag save button

        And I click on the sidenav back button

    Scenario: Clicking on a tab context menu manage tags button should open the tag management view
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then I should see the tab tag management view
        And I should see 2 visible tags in the tab tag management view
        And I should see the tag 0 with the label "qwerty" in the tab tag management view
        And I should see the tag 0 with the color 0 in the tab tag management view
        And I should see the tag 1 with the label "Yellow" in the tab tag management view
        And I should see the tag 1 with the color 3 in the tab tag management view

    Scenario: Clicking on an unchecked tag should add it to an opened tab
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 1 checkbox in the tab tag management view
        And I click on the tab tag management back button
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then the tag 0 in the tab tag management view should be unchecked
        And the tag 1 in the tab tag management view should be checked

        When I reload the tab 0
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then the tag 0 in the tab tag management view should be unchecked
        And the tag 1 in the tab tag management view should be checked

    Scenario: Clicking on a checked tag should remove it from an opened tab
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 1 checkbox in the tab tag management view

        Then the tag 1 in the tab tag management view should be checked

        When I click on the tag 1 checkbox in the tab tag management view
        And I click on the tab tag management back button
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then the tag 0 in the tab tag management view should be unchecked
        And the tag 1 in the tab tag management view should be unchecked

        When I reload the tab 0
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then the tag 0 in the tab tag management view should be unchecked
        And the tag 1 in the tab tag management view should be unchecked

    Scenario: Clicking on the new tag button should open the create tag form
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tab tag management view "add tag" button

        Then I should see the create tag form
        And the tag label input should be focused
        And the tag label input should be empty
        And the tag label input should not be marked as invalid

    Scenario: Creating a tag should add it to the tag list
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tab tag management view "add tag" button
        And I type "azerty" in the tag label input
        And I click on the tag save button

        Then I should not see the create tag form
        And I should see 3 visible tags in the tab tag management view
        And I should see the tag 0 with the label "azerty" in the tab tag management view
        And I should see the tag 0 with the color 0 in the tab tag management view
        And the tag 0 in the tab tag management view should be unchecked
        And I should see the tag 1 with the label "qwerty" in the tab tag management view
        And I should see the tag 1 with the color 0 in the tab tag management view
        And the tag 1 in the tab tag management view should be unchecked
        And I should see the tag 2 with the label "Yellow" in the tab tag management view
        And I should see the tag 2 with the color 3 in the tab tag management view
        And the tag 2 in the tab tag management view should be unchecked

    Scenario: A tag should be checked when all selected tabs have the tag
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab context menu manage tags button of the tab 2 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button

        Then the tag 0 in the tab tag management view should be checked

    Scenario: A tag should be unchecked when all selected tabs does not have the tag
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button

        Then the tag 0 in the tab tag management view should be unchecked

    Scenario: A tag should be indeterminate when some selected tabs have the tag
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button

        Then the tag 0 in the tab tag management view should be indeterminate

    Scenario: Clicking on an unchecked tag should add it to selected tabs
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button
        And I click on the tag 0 checkbox in the tab tag management view

        And I reload the tab 0
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button

        And the tag 0 in the tab tag management view should be checked

    Scenario: Clicking on a checked tag should remove it from selected tabs
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab context menu manage tags button of the tab 2 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button
        And I click on the tag 0 checkbox in the tab tag management view

        And I reload the tab 0
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button

        And the tag 0 in the tab tag management view should be unchecked

    Scenario: Clicking on an indeterminate tag should add it to selected tabs that does not have the tag
        When I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        And I click on the tag 0 checkbox in the tab tag management view
        And I click on the tab tag management back button

        Then I should not see the tab tag management view

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button
        And I click on the tag 0 checkbox in the tab tag management view

        And I reload the tab 0
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions manage tags button

        And the tag 0 in the tab tag management view should be checked

    Scenario: Clicking on an unchecked tag should add it to the sticky focused tab
        When I focus the tab 1
        And I click on the tab context menu manage tags button of the sticky focused tab
        And I click on the tag 1 checkbox in the tab tag management view
        And I click on the tab tag management back button
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"
        When I focus the tab 0

        Then the tag 0 in the tab tag management view should be unchecked
        And the tag 1 in the tab tag management view should be checked

        When I reload the tab 0
        And I click on the tab context menu manage tags button of the tab 1 on the tab list "opened-tabs"

        Then the tag 0 in the tab tag management view should be unchecked
        And the tag 1 in the tab tag management view should be checked
