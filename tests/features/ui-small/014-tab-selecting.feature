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

    Scenario: No opened tab selector should be checked at startup
        When I open the test page "test-page1"

        Then I should see 2 visible tabs on the workspace "opened-tabs"

        When I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I click on the tab selector of the tab 1 on workspace "opened-tabs"
        And I reload the tab 0

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as selected on the workspace "opened-tabs"
        And I should not see the tab 1 as selected on the workspace "opened-tabs"

# Clicking on the general opened tab selector when it is off should check all opened tab selectors
# Clicking on the general opened tab selector when it is on should uncheck all opened tab selectors
# Unchecking all opened tab selectors when the general opened tab selector is on should uncheck the general opened tab selector

# Checking an opened tab selector should reveal the selection more button
# Unchecking all opened tab selectors should unreveal the selection more button
# Unchecking an opened tab selector and leaving one on should not unreveal the selection more button
# Checking the general opened tab selector should reveal the selection more button
# Unchecking the general opened tab selector should unreveal the selection more button
# The selection more button should be unrevealed when a selected opened tab is removed and there is no remaining selected opened tab
