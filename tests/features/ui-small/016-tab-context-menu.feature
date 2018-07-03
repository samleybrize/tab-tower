@tabContextMenu
Feature: Tab context menu
    Background:
        Given I use the small UI

        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

    Scenario: A right click on a tab title should show the context menu
        When I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 0 on the workspace "opened-tabs" should not be visible
        And the context menu of the tab 1 on the workspace "opened-tabs" should be visible

    Scenario: A right click on a pinned tab title should show the context menu
        When I pin the tab 1
        And I right click on the title of the tab 0 on the workspace "pinned-tabs"

        Then the context menu of the tab 0 on the workspace "opened-tabs" should not be visible
        And the context menu of the tab 0 on the workspace "pinned-tabs" should be visible

    Scenario: A click outside of the context menu should hide the context menu
        When I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I click outside of the context menu

        Then the context menu of the tab 1 on the workspace "opened-tabs" should not be visible

    Scenario: The context menu of a tab should be hidden when a tab is opened
        When I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I open the test page "test-page2"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should not be visible

    Scenario: The context menu of a tab should be hidden when any tab is closed
        When I open the test page "test-page2"
        And I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I close the tab 2

        Then the context menu of the tab 1 on the workspace "opened-tabs" should not be visible

    Scenario: The context menu of a tab should be hidden when any tab is pinned
        When I open the test page "test-page2"
        And I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I pin the tab 2

        Then the context menu of the tab 1 on the workspace "opened-tabs" should not be visible

    Scenario: The context menu of a tab should be hidden when any tab is unpinned
        When I open the test page "test-page2"
        And I pin the tab 2

        Then I should see 1 visible tab on the workspace "pinned-tabs"

        When I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I unpin the tab 0

        Then the context menu of the tab 1 on the workspace "opened-tabs" should not be visible

    Scenario: The context menu of a tab should be hidden when any tab is moved
        When I open the test page "test-page2"
        And I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I move the tab 0 to position 1

        Then the context menu of the tab 0 on the workspace "opened-tabs" should not be visible
        Then the context menu of the tab 1 on the workspace "opened-tabs" should not be visible
        Then the context menu of the tab 2 on the workspace "opened-tabs" should not be visible

    Scenario: No element should be clickable when a context menu is opened
        When I right click on the title of the tab 1 on the workspace "opened-tabs"

        Then the context menu of the tab 1 on the workspace "opened-tabs" should be visible

        When I click where the title of the tab 1 on the workspace "opened-tabs" is

        Then I should see the browser's tab 0 as focused

        When I click where the title of the tab 1 on the workspace "opened-tabs" is

        Then I should see the browser's tab 1 as focused

    Scenario: Hovering a tab when a context menu is opened should not reveal its close button or its tab selector
        When I right click on the title of the tab 1 on the workspace "opened-tabs"
        And I hover the tab 1 on the workspace "opened-tabs"

        Then there should not be a visible close button on the tab 1 on the workspace "opened-tabs"
        And the tab selector of the tab 1 on the workspace "opened-tabs" should not be visible
