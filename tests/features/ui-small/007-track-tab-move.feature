@trackTabMove
Feature: Track tab move

    Background:
        Given I use the small UI

    Scenario: A moved tab should appear at its new position (forward)
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I focus the tab 1
        And I move the tab 1 to position 3

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should see the tab 3 as focused on the workspace "opened-tabs"

        When I reload the tab 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should see the tab 3 as focused on the workspace "opened-tabs"

    Scenario: A moved pinned tab should appear at its new position (forward)
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"
        And I open the test page "test-filter-with-some-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the workspace "pinned-tabs"

        When I focus the tab 0
        And I move the tab 0 to position 2

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should see the tab 2 as focused on the workspace "pinned-tabs"
        And I should not see the tab 3 as focused on the workspace "pinned-tabs"

        When I reload the tab 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should see the tab 2 as focused on the workspace "pinned-tabs"
        And I should not see the tab 3 as focused on the workspace "pinned-tabs"

    Scenario: A moved tab should appear at its new position (backward)
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"

        Then I should see 4 visible tabs on the workspace "opened-tabs"

        When I focus the tab 3
        And I move the tab 3 to position 1

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"

        When I reload the tab 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 3 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 1 as focused on the workspace "opened-tabs"
        And I should not see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"

    Scenario: A moved pinned tab should appear at its new position (backward)
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"
        And I open the test page "test-filter-with-some-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the workspace "pinned-tabs"

        When I focus the tab 2
        And I move the tab 2 to position 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should not see the tab 2 as focused on the workspace "pinned-tabs"
        And I should not see the tab 3 as focused on the workspace "pinned-tabs"

        When I reload the tab 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-page1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 2 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should not see the tab 2 as focused on the workspace "pinned-tabs"
        And I should not see the tab 3 as focused on the workspace "pinned-tabs"

    Scenario: A moved tab should appear at its new position (multiple)
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"
        And I open the test page "test-filter-with-some-text"

        Then I should see 5 visible tabs on the workspace "opened-tabs"

        When I focus the tab 3
        And I move the tab 1 to position 2
        And I move the tab 3 to position 2

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 4 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"
        And I should not see the tab 4 as focused on the workspace "opened-tabs"

        When I reload the tab 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page2" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-filter1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 3 on the workspace "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 4 on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 1 as focused on the workspace "opened-tabs"
        And I should see the tab 2 as focused on the workspace "opened-tabs"
        And I should not see the tab 3 as focused on the workspace "opened-tabs"
        And I should not see the tab 4 as focused on the workspace "opened-tabs"

    Scenario: A moved pinned tab should appear at its new position (multiple)
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter1"
        And I open the test page "test-filter-with-some-text"
        And I open the test page "test-filter-with-other-text"
        And I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4
        And I pin the tab 5

        Then I should see 5 visible tabs on the workspace "pinned-tabs"

        When I focus the tab 3
        And I move the tab 1 to position 2
        And I move the tab 3 to position 2

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 3 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 4 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should see the tab 2 as focused on the workspace "pinned-tabs"
        And I should not see the tab 3 as focused on the workspace "pinned-tabs"
        And I should not see the tab 4 as focused on the workspace "pinned-tabs"

        When I reload the tab 0

        Then I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 0 on the workspace "pinned-tabs"
        And I should see the test page "test-filter1" as tab 1 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the workspace "pinned-tabs"
        And I should see the test page "test-page2" as tab 3 on the workspace "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 4 on the workspace "pinned-tabs"
        And I should not see the tab 0 as focused on the workspace "opened-tabs"
        And I should not see the tab 0 as focused on the workspace "pinned-tabs"
        And I should not see the tab 1 as focused on the workspace "pinned-tabs"
        And I should see the tab 2 as focused on the workspace "pinned-tabs"
        And I should not see the tab 3 as focused on the workspace "pinned-tabs"
        And I should not see the tab 4 as focused on the workspace "pinned-tabs"

    Scenario: A moved tab should appear at its new position after a tab was closed
        When I open the test page "test-page1"
        And I open the test page "test-page2"
        And I open the test page "test-filter-with-some-text"
        And I open the test page "test-filter-with-other-text"

        Then I should see 5 visible tabs on the workspace "opened-tabs"

        When I close the tab 2

        Then I should see 4 visible tab on the workspace "opened-tabs"

        And I move the tab 3 to position 1

        Then I should see 4 visible tab on the workspace "opened-tabs"
        And I should see the small UI as tab 0 on the workspace "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 1 on the workspace "opened-tabs"
        And I should see the test page "test-page1" as tab 2 on the workspace "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 3 on the workspace "opened-tabs"
