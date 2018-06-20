@tabCloseButton
Feature: Tab close button

    Scenario: Clicking on a tab close button should close its associated tab
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the workspace "opened-tabs"

        When I click on the close button of the tab 1 on the workspace "opened-tabs"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"

    Scenario: Clicking on several tab close buttons should close their associated tabs
        Given I use the small UI

        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I click on the close button of the tab 2 on the workspace "opened-tabs"
        And I click on the close button of the tab 1 on the workspace "opened-tabs"

        Then I should see 2 visible tabs on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
