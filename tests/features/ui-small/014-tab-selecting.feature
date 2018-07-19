@tabSelecting
Feature: Tab selecting
    Background:
        Given I use the small UI

    Scenario: Clicking on an off opened tab selector should check it
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then I should not see the tab 0 as selected on the workspace "opened-tabs"
        And I should see the tab 1 as selected on the workspace "opened-tabs"

    Scenario: Clicking on an on opened tab selector should uncheck it
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then I should not see the tab 0 as selected on the workspace "opened-tabs"
        And I should not see the tab 1 as selected on the workspace "opened-tabs"

    Scenario: Clicking on an off opened tab selector with shift pressed should check selectors from it to the last clicked
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I shift click on the tab selector of the tab 3 on workspace "opened-tabs"

        Then I should not see the tab 0 as selected on the workspace "opened-tabs"
        And I should see the tab 1 as selected on the workspace "opened-tabs"
        And I should see the tab 2 as selected on the workspace "opened-tabs"
        And I should see the tab 3 as selected on the workspace "opened-tabs"

    Scenario: Clicking on an on opened tab selector with shift pressed should uncheck selectors from it to the last clicked
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 0 on workspace "opened-tabs"
        And I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 2 on workspace "opened-tabs"
        And I click on the tab selector of the tab 3 on workspace "opened-tabs"
        And I shift click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then I should see the tab 0 as selected on the workspace "opened-tabs"
        And I should not see the tab 1 as selected on the workspace "opened-tabs"
        And I should not see the tab 2 as selected on the workspace "opened-tabs"
        And I should not see the tab 3 as selected on the workspace "opened-tabs"

    Scenario: Clicking on the general tab selector when it is off should select all tabs
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the general tab selector

        Then the general tab selector should be checked
        And I should see the tab 0 as selected on the workspace "opened-tabs"
        And I should see the tab 1 as selected on the workspace "opened-tabs"
        And I should see the tab 0 as selected on the workspace "pinned-tabs"

    Scenario: Clicking on the general tab selector when it is on should unselect all tabs
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the general tab selector
        And I click on the general tab selector

        Then the general tab selector should not be checked
        And I should not see the tab 0 as selected on the workspace "opened-tabs"
        And I should not see the tab 1 as selected on the workspace "opened-tabs"
        And I should not see the tab 0 as selected on the workspace "pinned-tabs"

    Scenario: Unselecting all tabs when the general tab selector is on should uncheck the general tab selector
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the general tab selector
        And I click on the tab selector of the tab 0 on workspace "opened-tabs"
        And I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 0 on workspace "pinned-tabs"

        Then the general tab selector should not be checked

    Scenario: Selecting a tab when the general tab selector is off should check the general tab selector
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"

        Then the general tab selector should be checked

    Scenario: Selecting a pinned tab when the general tab selector is off should check the general tab selector
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I pin the tab 2

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 0 on workspace "pinned-tabs"

        Then the general tab selector should be checked

    Scenario: Pinning a selected tab then unselecting it should uncheck the general tab selector
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And I should see the tab 0 as selected on the workspace "pinned-tabs"

        When I click on the tab selector of the tab 0 on workspace "pinned-tabs"

        Then the general tab selector should not be checked

    Scenario: Unpinning a selected pinned tab then unselecting it should uncheck the general tab selector
        When I open the test page "test-page1"
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 0 on workspace "pinned-tabs"
        And I unpin the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the tab 0 as selected on the workspace "opened-tabs"

        When I click on the tab selector of the tab 0 on workspace "opened-tabs"

        Then the general tab selector should not be checked

    Scenario: Closing all selected tabs should uncheck the general tab selector
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I close the tab 1

        Then the general tab selector should not be checked

    Scenario: Closing all selected pinned tabs should uncheck the general tab selector
        When I open the test page "test-page1"
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "pinned-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 0 on workspace "pinned-tabs"
        And I close the tab 0

        Then the general tab selector should not be checked

    Scenario: No opened tab selector should be checked at startup
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And the general tab selector should not be checked

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I reload the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as selected on the workspace "opened-tabs"
        And I should not see the tab 1 as selected on the workspace "opened-tabs"
        And the general tab selector should not be checked

    Scenario: Tab favicon should not be visible on hover when the tab is selected
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 0 on workspace "opened-tabs"
        And I hover the tab 1 on the workspace "opened-tabs"

        Then I should not see the favicon of the tab 1 on the workspace "opened-tabs"
