@tabContextMenuDiscardButton
Feature: Tab context menu - Discard button
    Background:
        Given I use the small UI

    Scenario: Clicking on a tab context menu discard button should discard the tab
        When I open an empty tab

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should not see the tab 1 as discarded on the workspace "opened-tabs"

        When I click on the tab context menu discard button of the tab 1 on the workspace "opened-tabs"

        Then I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should see the tab 1 as discarded on the workspace "opened-tabs"
        And I should not see the discard button on the tab context menu of the tab 1 on the workspace "opened-tabs"

    Scenario: Clicking on a pinned tab context menu discard button should discard the tab
        When I open an empty tab
        And I pin the tab 1

        Then I should see 1 visible tab on the workspace "opened-tabs"
        And I should see 1 visible tab on the workspace "pinned-tabs"
        And I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should not see the tab 0 as discarded on the workspace "pinned-tabs"

        When I click on the tab context menu discard button of the tab 0 on the workspace "pinned-tabs"

        Then I should not see the tab 0 as discarded on the workspace "opened-tabs"
        And I should see the tab 0 as discarded on the workspace "pinned-tabs"
        And I should not see the discard button on the tab context menu of the tab 0 on the workspace "pinned-tabs"
