@tabFilter
Feature: Tab filter

    Background:
        Given I use the small UI

        When I open the test page "test-filter1"
        And I open the test page "test-filter-with-some-text"
        And I open the test page "test-filter-with-other-text"
        And I open the test page "test-page1"

        Then I should see 5 visible tabs on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"

    Scenario: Should filter opened tabs by title on input with one word
        When I type "azerty" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should filter pinned tabs by title on input with one word
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "azerty" in the tab filter input

        Then I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should filter opened tabs by title on input with two word
        When I type "azerty qwerty" in the tab filter input

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 1 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should filter pinned tabs by title on input with two word
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "azerty qwerty" in the tab filter input

        Then I should see 2 visible tabs on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 1 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should ignore tabs with an empty title
        When I open the test page "test-filter-without-title"

        Then I should see 6 visible tabs on the tab list "opened-tabs"

        When I type "azerty qwerty" in the tab filter input

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 1 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 6 tabs indicated

    Scenario: Should filter opened tabs by url on input with one word
        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated

    Scenario: Should filter pinned tabs by url on input with one word
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated

    Scenario: Should filter opened tabs by url on input with two word
        When I type "some other" in the tab filter input

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 1 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated

    Scenario: Should filter pinned tabs by url on input with two word
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "some other" in the tab filter input

        Then I should see 2 visible tabs on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 1 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated

    Scenario: Should filter opened tabs by url with protocol ignored
        When I type "moz-extension" in the tab filter input

        Then I should see 0 visible tab on the tab list "opened-tabs"
        And I should see that no tab matches tab search on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"

    Scenario: Should filter pinned tabs by url with protocol ignored
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "moz-extension" in the tab filter input

        Then I should see 0 visible tab on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"

    Scenario: Should show the no tab row in opened tabs list when the filter do not match any tab
        When I type "unknown" in the tab filter input

        Then I should see 0 visible tab on the tab list "opened-tabs"
        And I should see that no tab matches tab search on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should show all opened tabs when clearing the input
        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I delete all characters in the tab filter input

        Then I should see 5 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 3 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 4 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should not see the clear tab filter button

    Scenario: Should show all opened tabs when clicking on the clear tab filter button
        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I click on the clear tab filter button

        Then I should see 5 visible tabs on the tab list "opened-tabs"
        And I should see the small UI as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-filter1" as tab 1 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 2 on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 3 on the tab list "opened-tabs"
        And I should see the test page "test-page1" as tab 4 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should not see the clear tab filter button

    Scenario: Should show all pinned tabs when clearing the input
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I delete all characters in the tab filter input

        Then I should see 4 visible tabs on the tab list "pinned-tabs"
        And I should see the test page "test-filter1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 1 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 2 on the tab list "pinned-tabs"
        And I should see the test page "test-page1" as tab 3 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should not see the clear tab filter button

    Scenario: Should show all pinned tabs when clicking on the clear tab filter button
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I click on the clear tab filter button

        Then I should see 4 visible tabs on the tab list "pinned-tabs"
        And I should see the test page "test-filter1" as tab 0 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 1 on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-other-text" as tab 2 on the tab list "pinned-tabs"
        And I should see the test page "test-page1" as tab 3 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should not see the clear tab filter button

    Scenario: Should filter opened tabs at startup when the input is not empty
        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should not see that no tab matches tab search on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should filter pinned tabs at startup when the input is not empty
        When I pin the tab 1
        And I pin the tab 2
        And I pin the tab 3
        And I pin the tab 4

        Then I should see 4 visible tabs on the tab list "pinned-tabs"

        When I type "some" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I reload the tab 0

        Then I should see 1 visible tab on the tab list "pinned-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "pinned-tabs"
        And I should not see that no tab matches tab search on the tab list "pinned-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should update shown tabs when their url change
        When I type "some favicon" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When the tab 4 navigates to the test page "test-page-without-favicon"
        And the tab 2 navigates to the test page "test-page1"

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-page-without-favicon" as tab 0 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should update shown tabs when their title change
        When I type "azerty favicon" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When the tab 4 navigates to the test page "test-page-without-favicon"
        And the tab 2 navigates to the test page "test-page1"

        Then I should see 1 visible tab on the tab list "opened-tabs"
        And I should see the test page "test-page-without-favicon" as tab 0 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 5 tabs indicated
        And I should see the clear tab filter button

    Scenario: Should apply filter on new tabs
        When I type "azerty favicon" in the tab filter input

        Then I should see 1 visible tab on the tab list "opened-tabs"

        When I open the test page "test-page-without-favicon"

        Then I should see 2 visible tabs on the tab list "opened-tabs"
        And I should see the test page "test-filter-with-some-text" as tab 0 on the tab list "opened-tabs"
        And I should see the test page "test-page-without-favicon" as tab 1 on the tab list "opened-tabs"
        And I should see the current tab list with label "All opened tabs" and 6 tabs indicated
        And I should see the clear tab filter button
 