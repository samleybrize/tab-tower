@selectedTabsActionsMoveButton
Feature: Selected tabs actions - Move button
    Background:
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

    Scenario: A click on the selection move button should reveal move targets
        When I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the selected tabs actions move button

        Then I should see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should see the move above button on the tab 3 on the tab list "opened-tabs"
        And the move below all button should be visible
        And the selected tabs actions button should not be visible
        And the cancel tab move button should be visible

    Scenario: A click on the selection move button should highlight selected tab rows
        When I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the selected tabs actions move button

        Then I should not see the tab 0 as being moved on the tab list "opened-tabs"
        And I should not see the tab 1 as being moved on the tab list "opened-tabs"
        And I should see the tab 2 as being moved on the tab list "opened-tabs"
        And I should see the tab 3 as being moved on the tab list "opened-tabs"

    Scenario: A click on "move above" should move selected tab rows above the clicked row when they are lower than it
        When I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 1 on the tab list "opened-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the tab list "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on "move above" should move selected pinned tab rows above the clicked row when they are lower than it
        When I open the test page "test-filter-with-some-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I click on the tab selector of the tab 2 on tab list "pinned-tabs"
        And I click on the tab selector of the tab 3 on tab list "pinned-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 1 on the tab list "pinned-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 3 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 1 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 2 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 3 on the tab list "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 4
        And I click on the title of the tab 2 on the tab list "pinned-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on "move above" should move selected tab rows above the clicked row when they are higher than it
        When I open the test page "test-filter-with-some-text"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 4 on the tab list "opened-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 3 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 4 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 4 on the tab list "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the tab list "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on "move above" should move selected pinned tab rows above the clicked row when they are higher than it
        When I open the test page "test-filter-with-some-text"
        And I open the test page "test-filter-with-other-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4
        And I pin the tab 5

        Then I should see 5 visible tabs on the tab list "pinned-tabs"

        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the tab selector of the tab 2 on tab list "pinned-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 4 on the tab list "pinned-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 1 on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "pinned-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 4 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 1 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 2 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 3 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 4 on the tab list "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 5
        And I click on the title of the tab 2 on the tab list "pinned-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on the "move below others" should move selected tab rows at the last position
        When I open the test page "test-filter-with-some-text"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I click on the move below all button

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 4 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 4 on the tab list "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the tab list "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on the "move below others" should not move selected pinned tab rows
        When I open the test page "test-filter-with-some-text"
        And I open the test page "test-filter-with-other-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4
        And I pin the tab 5

        Then I should see 5 visible tabs on the tab list "pinned-tabs"

        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the tab selector of the tab 2 on tab list "pinned-tabs"
        And I click on the selected tabs actions move button
        And I click on the move below all button

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "pinned-tabs"
        And I should see the test page "test-filter1" as tab 2 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 4 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 1 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 2 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 3 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 4 on the tab list "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 5
        And I click on the title of the tab 2 on the tab list "pinned-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on "move above" on one of the selected tabs should move selected tabs below it and keep their order
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 1 on the tab list "opened-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the tab list "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on "move above" on one of the selected tabs should move selected pinned tabs below it and keep their order
        When I open the test page "test-filter-with-some-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the tab selector of the tab 3 on tab list "pinned-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 1 on the tab list "pinned-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the tab list "pinned-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 1 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 2 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 3 on the tab list "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 4
        And I click on the title of the tab 2 on the tab list "pinned-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: A click on "move above" with pinned and unpinned tabs selected should move tabs that can go to the new position
        When I open the test page "test-filter-with-some-text"
        When I open the test page "test-filter-with-other-text"
        And I pin the tab 1
        And I pin the tab 2

        Then I should see 2 visible tabs on the tab list "pinned-tabs"

        When I click on the tab selector of the tab 0 on tab list "pinned-tabs"
        And I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 2 on the tab list "opened-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 1 on the tab list "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "pinned-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 2
        And I click on the title of the tab 1 on the tab list "pinned-tabs"

        Then I should see the browser's tab 1 as focused

    Scenario: A click on "move above" should do nothing when all tabs are selected
        When I click on the tab selector of the tab 0 on tab list "opened-tabs"
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 2 on tab list "opened-tabs"
        And I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I click on the move above button of the tab 1 on the tab list "opened-tabs"

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 0
        And I click on the title of the tab 2 on the tab list "opened-tabs"

        Then I should see the browser's tab 2 as focused

    Scenario: Only move targets and move cancel button should be clickable when they are visible
        When I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the selected tabs actions move button

        Then I should see the tab 1 as being moved on the tab list "opened-tabs"
        And I should see the tab 3 as being moved on the tab list "opened-tabs"

        When I hover the tab 2 on the tab list "opened-tabs"

        Then there should not be a visible close button on the tab 2 on the tab list "opened-tabs"
        And the tab selector of the tab 2 on the tab list "opened-tabs" should not be visible
        And I should see the favicon of the tab 2 on the tab list "opened-tabs"
        And the title of the tab 2 on the tab list "opened-tabs" should not be clickable

        And the tab selector of the tab 3 on the tab list "opened-tabs" should not be visible
        And I should see the favicon of the tab 3 on the tab list "opened-tabs"

        And the general tab selector should not be clickable
        And the new tab button should not be clickable

    Scenario: Clicking on the move cancel button should unreveal move targets without moving the tab
        When I open the test page "test-filter-with-some-text"
        And I pin the tab 4

        When I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the tab selector of the tab 0 on tab list "pinned-tabs"
        And I click on the selected tabs actions move button
        And I click on the cancel tab move button

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "pinned-tabs"
        And I should not see the tab 0 as being moved on the tab list "opened-tabs"
        And I should not see the tab 1 as being moved on the tab list "opened-tabs"
        And I should not see the tab 2 as being moved on the tab list "opened-tabs"
        And I should not see the tab 3 as being moved on the tab list "opened-tabs"
        And I should not see the tab 0 as being moved on the tab list "pinned-tabs"
        And I should not see the move above button on the tab 0 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 1 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 2 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 3 on the tab list "opened-tabs"
        And I should not see the move above button on the tab 0 on the tab list "pinned-tabs"
        And the move below all button should not be visible

        # ensure UI elements are clickable again
        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the general tab selector
        And I click on the new tab button
        And I focus the tab 1
        And I click on the title of the tab 2 on the tab list "opened-tabs"

        Then I should see the browser's tab 3 as focused

    Scenario: The tab list should be scrollable when tabs are being moved
        Given window height is 360

        When I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the selected tabs actions move button
        And I scroll the unpinned tabs list down

        Then the tab 3 on the tab list "opened-tabs" should be visible in the viewport

    Scenario: The tab filter should be usable when move targets are visible
        When I click on the tab selector of the tab 3 on tab list "opened-tabs"
        And I click on the tab selector of the tab 1 on tab list "opened-tabs"
        And I click on the selected tabs actions move button

        Then I should see the move above button on the tab 1 on the tab list "opened-tabs"

        When I type "filter" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the tab list "opened-tabs"

        When I click on the move above button of the tab 0 on the tab list "opened-tabs"
        And I delete all characters in the tab filter input

        Then I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 3 on the tab list "opened-tabs"
