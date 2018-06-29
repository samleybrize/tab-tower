@tabContextMenu
Feature: Tab context menu
    Background:
        Given I use the small UI

        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

    # TODO A right click on a tab title should show the context menu
    # TODO A right click on a pinned tab title should show the context menu
    # TODO A click outside of the context menu should hide the context menu

    # TODO context menu position?
    # TODO other elements not clickable?
    # TODO hide context menu when a tab is closed
    # TODO hide context menu when a tab is opened
    # TODO hide context menu when a tab is pinned
    # TODO hide context menu when a tab is unpinned
    # TODO hide context menu when a tab is moved
