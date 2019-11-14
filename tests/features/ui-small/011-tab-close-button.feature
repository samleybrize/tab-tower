@tabCloseButton
Feature: Tab close button

    Background:
        Given I use the small UI

    Scenario: Clicking on a tab close button should close its associated tab
        When I open the test page "test-page1"
        And I open the test page "test-page2"

        Then I should see 3 visible tabs on the tab list "opened-tabs"

        When I click on the close button of the tab 1 on the tab list "opened-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 2 tabs indicated

    Scenario: Clicking on several tab close buttons should close their associated tabs
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the tab list "opened-tabs"

        When I click on the close button of the tab 2 on the tab list "opened-tabs"
        And I click on the close button of the tab 1 on the tab list "opened-tabs"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 2 tabs indicated

    Scenario: Pinned tabs should not have a close button
        When I open the test page "test-page1"
        And I pin the tab 1

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see 1 visible tab on the tab list "pinned-tabs"
        And there should not be a visible close button on the tab 0 on the tab list "pinned-tabs"

    Scenario: Sticky focused tab should not have a close button
        Then I should see 1 visible tab on the tab list "opened-tabs"
        And there should not be a visible close button on the sticky focused tab
