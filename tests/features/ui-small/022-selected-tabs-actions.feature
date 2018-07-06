@selectedTabsActions
Feature: Selected tabs actions
    Background:
        Given I use the small UI

        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

    Scenario: Selecting a tab should reveal the selected tabs actions button
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then the selected tabs actions button should be visible

    Scenario: Unselecting all tabs should unreveal the selected tabs actions button
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then the selected tabs actions button should be visible

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then the selected tabs actions button should not be visible

    Scenario: Pinning a selected tab should not unreveal the selected tabs actions button
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And the selected tabs actions button should be visible

    Scenario: Unpinning a selected tab should not unreveal the selected tabs actions button
        When I pin the tab 1
        And I click on the tab selector of the tab 0 on workspace "pinned-tabs"
        And I unpin the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And the selected tabs actions button should be visible

    Scenario: A click on the selected tabs actions button should open the context menu
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the selected tabs actions button

        Then the selected tabs actions context menu should be visible

    Scenario: A click outside of the context menu should hide the context menu
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the selected tabs actions button

        Then the selected tabs actions context menu should be visible

        When I click outside of the context menu

        Then the selected tabs actions context menu should not be visible

    Scenario: Hovering a tab when a context menu is opened should not reveal its close button or its tab selector
        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the selected tabs actions button
        And I hover the tab 1 on the workspace "opened-tabs"

        Then there should not be a visible close button on the tab 0 on the workspace "opened-tabs"
        And the tab selector of the tab 0 on the workspace "opened-tabs" should not be visible
