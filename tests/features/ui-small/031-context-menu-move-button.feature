@tabContextMenuMoveButton
Feature: Tab context menu - Move button
    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

    Scenario: Clicking on a tab context menu move button should reveal move targets
        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"

        Then I should see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should see the move above button on the tab 1 on the workspace "opened-tabs"
        And I should see the move above button on the tab 2 on the workspace "opened-tabs"
        And I should see the move above button on the tab 3 on the workspace "opened-tabs"
        And the move below all button should be visible
        And the selected tabs actions button should not be visible
        And the cancel tab move button should be visible

    Scenario: Clicking on a pinned tab context menu move button should reveal move targets
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3

        Then I should see 3 visible tabs on the workspace "pinned-tabs"

        When I click on the tab context menu move button of the tab 1 on the workspace "pinned-tabs"

        Then I should see the move above button on the tab 0 on the workspace "pinned-tabs"
        And I should see the move above button on the tab 1 on the workspace "pinned-tabs"
        And I should see the move above button on the tab 2 on the workspace "pinned-tabs"
        And I should see the move above button on the tab 0 on the workspace "opened-tabs"
        And the move below all button should be visible

    Scenario: Clicking on a tab context menu move button should highlight the tab being moved
        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"

        Then I should not see the tab 0 as being moved on the workspace "opened-tabs"
        And I should see the tab 1 as being moved on the workspace "opened-tabs"
        And I should not see the tab 2 as being moved on the workspace "opened-tabs"
        And I should not see the tab 3 as being moved on the workspace "opened-tabs"

    Scenario: Clicking on a pinned tab context menu move button should highlight the tab being moved
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3

        Then I should see 3 visible tabs on the workspace "pinned-tabs"

        When I click on the tab context menu move button of the tab 1 on the workspace "pinned-tabs"

        Then I should not see the tab 0 as being moved on the workspace "pinned-tabs"
        And I should see the tab 1 as being moved on the workspace "pinned-tabs"
        And I should not see the tab 2 as being moved on the workspace "pinned-tabs"
        And I should not see the tab 0 as being moved on the workspace "opened-tabs"

    Scenario: Clicking on "move above" should move the tab above the clicked tab when the former is lower than the latter
        When I click on the tab context menu move button of the tab 3 on the workspace "opened-tabs"
        And I click on the move above button of the tab 1 on the workspace "opened-tabs"

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 3 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 1 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 2 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 3 on the workspace "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the workspace "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: Clicking on "move above" should move the pinned tab above the clicked tab when the former is lower than the latter
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3

        Then I should see 3 visible tabs on the workspace "pinned-tabs"

        When I click on the tab context menu move button of the tab 2 on the workspace "pinned-tabs"
        And I click on the move above button of the tab 1 on the workspace "pinned-tabs"

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 0 on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 1 on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 2 on the workspace "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on workspace "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 3
        And I click on the title of the tab 2 on the workspace "pinned-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: Clicking on "move above" should move the tab above the clicked tab when the former is higher than the latter
        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"
        And I click on the move above button of the tab 3 on the workspace "opened-tabs"

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 1 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 2 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 3 on the workspace "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the workspace "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: Clicking on "move above" should move the pinned tab above the clicked tab when the former is higher than the latter
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3

        Then I should see 3 visible tabs on the workspace "pinned-tabs"

        When I click on the tab context menu move button of the tab 0 on the workspace "pinned-tabs"
        And I click on the move above button of the tab 2 on the workspace "pinned-tabs"

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-filter1" as tab 2 on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 0 on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 1 on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 2 on the workspace "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on workspace "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 3
        And I click on the title of the tab 2 on the workspace "pinned-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: Clicking on "move below others" should move the tab at the last position
        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"
        And I click on the move below all button

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 1 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 2 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 3 on the workspace "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the workspace "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: Only move targets and move cancel button should be clickable when they are visible
        When I click on the tab selector of the tab 3 on workspace "opened-tabs"
        And I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"

        Then I should see the tab 1 as being moved on the workspace "opened-tabs"

        When I hover the tab 2 on the workspace "opened-tabs"

        Then there should not be a visible close button on the tab 2 on the workspace "opened-tabs"
        And the tab selector of the tab 2 on the workspace "opened-tabs" should not be visible
        And I should see the favicon of the tab 2 on the workspace "opened-tabs"
        And the title of the tab 2 on the workspace "opened-tabs" should not be clickable

        And the tab selector of the tab 3 on the workspace "opened-tabs" should not be visible
        And I should see the favicon of the tab 3 on the workspace "opened-tabs"

        And the general tab selector should not be clickable
        And the new tab button should not be clickable

    Scenario: Clicking on the move cancel button should unreveal move targets without moving the tab
        When I open the test page "test-filter-with-some-text"
        And I pin the tab 4

        Then I should see 1 visible tab on the workspace "pinned-tabs"

        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"
        And I click on the cancel tab move button

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the workspace "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the workspace "pinned-tabs"
        And I should not see the tab 0 as being moved on the workspace "opened-tabs"
        And I should not see the tab 1 as being moved on the workspace "opened-tabs"
        And I should not see the tab 2 as being moved on the workspace "opened-tabs"
        And I should not see the tab 3 as being moved on the workspace "opened-tabs"
        And I should not see the tab 0 as being moved on the workspace "pinned-tabs"
        And I should not see the move above button on the tab 0 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 1 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 2 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 3 on the workspace "opened-tabs"
        And I should not see the move above button on the tab 0 on the workspace "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 1
        And I click on the title of the tab 2 on the workspace "opened-tabs"

        Then I should see the browser's tab 3 as focused

    Scenario: Clicking on the title of a moved tab should focus its associated opened tab
        When I click on the tab context menu move button of the tab 3 on the workspace "opened-tabs"
        And I click on the move above button of the tab 1 on the workspace "opened-tabs"

        Then I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"

        When I click on the title of the tab 1 on the workspace "opened-tabs"

        Then I should see the browser's tab 1 as focused

    Scenario: Clicking on the title of a moved pinned tab should focus its associated opened tab
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I click on the tab context menu move button of the tab 2 on the workspace "pinned-tabs"
        And I click on the move above button of the tab 1 on the workspace "pinned-tabs"

        Then I should see the test page "test-filter1" as tab 1 on the workspace "pinned-tabs"

        When I click on the title of the tab 1 on the workspace "pinned-tabs"

        Then I should see the browser's tab 1 as focused

    Scenario: Move mode should not be impacted when an opened tab is moved from the browser
        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"

        Then I should see the move above button on the tab 1 on the workspace "opened-tabs"

        When I move the tab 1 to position 3

        Then I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"

        When I click on the move above button of the tab 2 on the workspace "opened-tabs"

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the workspace "opened-tabs"

    Scenario: The tab list should be scrollable when a tab is being moved
        Given window height is 300

        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"
        And I scroll the unpinned tabs list down

        Then the tab 3 on the workspace "opened-tabs" should be visible in the viewport

    Scenario: The tab filter should be usable when move targets are visible
        When I click on the tab context menu move button of the tab 1 on the workspace "opened-tabs"

        Then I should see the move above button on the tab 1 on the workspace "opened-tabs"

        When I type "filter" in the tab filter input

        Then I should see 1 visible tab on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the workspace "opened-tabs"

        When I click on the move above button of the tab 0 on the workspace "opened-tabs"
        And I delete all characters in the tab filter input

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the workspace "opened-tabs"
