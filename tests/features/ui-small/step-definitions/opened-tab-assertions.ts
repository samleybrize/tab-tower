import { Then } from 'cucumber';
import { error as WebDriverError, WebElement } from 'selenium-webdriver';
import { sleep } from '../../../../src/typescript/utils/sleep';
import { TestPageNames } from '../../../webdriver/test-page-descriptor';
import { TabContextMenuButtons } from '../support/opened-tab-list-support';
import { World } from '../support/world';

Then('I should see {int} visible tab(s) on the tab list {string}', async function(expectedNumberOfTabs: number, tabListId: string) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    let actualNumberOfTabs = 0;
    await webdriverHelper.wait(async () => {
        const tabList = await openedTabListSupport.getAllTabElements(tabListId);

        if (tabList.length < expectedNumberOfTabs) {
            return false;
        }

        actualNumberOfTabs = await browserSupport.getNumberOfVisibleElements(tabList);

        return expectedNumberOfTabs == actualNumberOfTabs;
    }, world.defaultWaitTimeout, () => `Number of visible tabs on tab list "${tabListId}" is "${actualNumberOfTabs}" but "${expectedNumberOfTabs}" were expected`);
});

Then('I should see that no tab matches tab search on the tab list {string}', async function(tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const noTabMatchesSearchElement = world.openedTabListSupport.getNoTabMatchesTabSearchElement(tabListId);

    await webdriver.wait(async () => {
        return await noTabMatchesSearchElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The no tab matches tab search message is not visible');
});

Then('I should not see that no tab matches tab search on the tab list {string}', async function(tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const noTabMatchesSearchElement = world.openedTabListSupport.getNoTabMatchesTabSearchElement(tabListId);

    await webdriver.wait(async () => {
        return !await noTabMatchesSearchElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The no tab matches tab search message is visible');
});

Then('I should see the small UI as sticky focused tab', async function() {
    const world = this as World;
    await TabAssertions.assertStickyFocusedTab(world, TestPageNames.UI_SMALL);
});

Then('I should see the test page {string} as sticky focused tab', async function(expectedTestPageName: string) {
    const world = this as World;
    await TabAssertions.assertStickyFocusedTab(world, expectedTestPageName);
});

Then('I should see the small UI as tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertTab(world, tabListId, tabPosition, TestPageNames.UI_SMALL);
});

Then('I should see the test page {string} as tab {int} on the tab list {string}', async function(expectedTestPageName: string, tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertTab(world, tabListId, tabPosition, expectedTestPageName);
});

Then('I should see the url {string} on the tab {int} of the tab list {string}', async function(expectedUrl: string, tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    await TabAssertions.assertTabUrl(world, tab, expectedUrl);
});

Then('I should see the url domain {string} on the tab {int} of the tab list {string}', async function(expectedDomain: string, tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    await TabAssertions.assertTabDomain(world, tab, expectedDomain);
});

Then('I should not see the url domain of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const domainElement = openedTabListSupport.getTabUrlDomainElement(tab);

    await webdriver.wait(async () => {
        return !await domainElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab url domain is visible');
});

Then('I should see the url domain of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const domainElement = openedTabListSupport.getTabUrlDomainElement(tab);

    await webdriver.wait(async () => {
        return await domainElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab url domain is not visible');
});

Then('I should not see the url of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const urlElement = openedTabListSupport.getTabUrlElement(tab);

    await webdriver.wait(async () => {
        return !await urlElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab url is visible');
});

Then('I should see the url of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const urlElement = openedTabListSupport.getTabUrlElement(tab);

    await webdriver.wait(async () => {
        return await urlElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab url is not visible');
});

Then('I should not see the favicon of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const faviconElement = openedTabListSupport.getTabFaviconElement(tab);

    await webdriver.wait(async () => {
        return !await faviconElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab favicon is visible');
});

Then('I should see the favicon of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const faviconElement = openedTabListSupport.getTabFaviconElement(tab);

    await webdriver.wait(async () => {
        return await faviconElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab favicon is not visible');
});

Then('I should not see the tab {int} as audible on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const audibleElement = openedTabListSupport.getTabAudibleIconElement(tab);

    await webdriver.wait(async () => {
        return !await audibleElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab audible icon is visible');
});

Then('I should see the tab {int} as audible on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const audibleElement = openedTabListSupport.getTabAudibleIconElement(tab);

    await webdriver.wait(async () => {
        return await audibleElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab audible icon is not visible');
});

Then('I should not see the sticky focused tab as audible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();
    const audibleElement = openedTabListSupport.getTabAudibleIconElement(tab);

    await webdriver.wait(async () => {
        return !await audibleElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sticky focused tab audible icon is visible');
});

Then('I should see the sticky focused tab as audible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();
    const audibleElement = openedTabListSupport.getTabAudibleIconElement(tab);

    await webdriver.wait(async () => {
        return await audibleElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sticky focused tab audible icon is not visible');
});

Then('I should not see the tab {int} as muted on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const mutedElement = openedTabListSupport.getTabMutedIconElement(tab);

    await webdriver.wait(async () => {
        return !await mutedElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab muted icon is visible');
});

Then('I should see the tab {int} as muted on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const mutedElement = openedTabListSupport.getTabMutedIconElement(tab);

    await webdriver.wait(async () => {
        return await mutedElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab muted icon is not visible');
});

Then('I should not see the sticky focused tab as muted', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();
    const mutedElement = openedTabListSupport.getTabMutedIconElement(tab);

    await webdriver.wait(async () => {
        return !await mutedElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sticky focused tab muted icon is visible');
});

Then('I should see the sticky focused tab as muted', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();
    const mutedElement = openedTabListSupport.getTabMutedIconElement(tab);

    await webdriver.wait(async () => {
        return await mutedElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sticky focused tab muted icon is not visible');
});

Then('I should not see the tab {int} as focused on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabMarkedAsFocused(tab);
    }, world.defaultWaitTimeout, 'Tab is marked as focused');
});

Then('I should see the tab {int} as focused on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsFocused(tab);
    }, world.defaultWaitTimeout, 'Tab is not marked as focused');
});

Then('I should not see the tab {int} as loading on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabMarkedAsLoading(tab);
    }, world.defaultWaitTimeout, 'Tab is marked as loading');
});

Then('I should see the tab {int} as loading on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsLoading(tab);
    }, world.defaultWaitTimeout, 'Tab is not marked as loading');
});

Then('I should not see the sticky focused tab as loading', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabMarkedAsLoading(tab);
    }, world.defaultWaitTimeout, 'Sticky focused tab is marked as loading');
});

Then('I should see the sticky focused tab as loading', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsLoading(tab);
    }, world.defaultWaitTimeout, 'Sticky focused tab is not marked as loading');
});

Then('I should not see the tab {int} as being moved on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabMarkedAsBeingMoved(tab);
    }, world.defaultWaitTimeout, 'Tab is marked as being moved');
});

Then('I should see the tab {int} as being moved on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsBeingMoved(tab);
    }, world.defaultWaitTimeout, 'Tab is not marked as being moved');
});

Then('I should not see the tab {int} as selected on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const faviconElement = openedTabListSupport.getTabFaviconElement(tab);

    await webdriver.actions().move({x: 0, y: 0}).perform();

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabNotMarkedAsSelected(tab) && await faviconElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab is marked as selected');
});

Then('I should see the tab {int} as selected on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const faviconElement = openedTabListSupport.getTabFaviconElement(tab);

    await webdriver.actions().move({x: 0, y: 0}).perform();

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsSelected(tab) && !await faviconElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab is not marked as selected');
});

Then('I should not see the filtered tab {int} as selected on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'filtered');

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabMarkedAsSelected(tab);
    }, world.defaultWaitTimeout, 'Tab is marked as selected');
});

Then('I should see the filtered tab {int} as selected on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'filtered');

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsSelected(tab);
    }, world.defaultWaitTimeout, 'Tab is not marked as selected');
});

Then('I should not see the tab {int} as discarded on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabMarkedAsDiscarded(tab);
    }, world.defaultWaitTimeout, 'Tab is marked as discarded');
});

Then('I should see the tab {int} as discarded on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return await openedTabListSupport.isTabMarkedAsDiscarded(tab);
    }, world.defaultWaitTimeout, 'Tab is not marked as discarded');
});

Then('there should not be a visible close button on the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const closeButton = openedTabListSupport.getTabCloseButtonElement(tab);

    await webdriver.actions().move({origin: tab}).perform();
    await sleep(200);

    if (await closeButton.isDisplayed()) {
        throw new Error(`Close button of tab at position ${tabPosition} of tab list "${tabListId}" is visible`);
    }
});

Then('there should be a visible close button on the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const closeButton = openedTabListSupport.getTabCloseButtonElement(tab);

    await webdriver.actions().move({origin: tab}).perform();

    await webdriver.wait(async () => {
        return await closeButton.isDisplayed();
    }, world.defaultWaitTimeout, `Close button of tab at position ${tabPosition} of tab list "${tabListId}" is not visible`);
});

Then('there should not be a visible close button on the sticky focused tab', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();
    const closeButton = openedTabListSupport.getTabCloseButtonElement(tab);

    await webdriver.actions().move({origin: tab}).perform();
    await sleep(200);

    if (await closeButton.isDisplayed()) {
        throw new Error(`Close button of sticky focused tab is visible`);
    }
});

Then('the tab selector of the tab {int} on the tab list {string} should not be visible', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.actions().move({origin: tab}).perform();
    await sleep(200);

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabSelectorVisible(tab);
    }, world.defaultWaitTimeout, `Tab selector of tab at position ${tabPosition} of tab list "${tabListId}" is visible`);
});

Then('there should not be a visible tab selector on the sticky focused tab', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();

    await webdriver.actions().move({origin: tab}).perform();
    await sleep(200);

    await webdriver.wait(async () => {
        return !await openedTabListSupport.isTabSelectorVisible(tab);
    }, world.defaultWaitTimeout, `Tab selector of the sticky focused tab is visible`);
});

Then('the context menu of the tab {int} on the tab list {string} should not be visible', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const contextMenu = openedTabListSupport.getTabContextMenuElement(tab);

    await webdriver.wait(async () => {
        return !await contextMenu.isDisplayed();
    }, world.defaultWaitTimeout, `Context menu of tab at position ${tabPosition} on tab list "${tabListId}" is visible`);
});

Then('the context menu of the tab {int} on the tab list {string} should be visible', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const contextMenu = openedTabListSupport.getTabContextMenuElement(tab);

    await webdriver.wait(async () => {
        return await contextMenu.isDisplayed();
    }, world.defaultWaitTimeout, `Context menu of tab at position ${tabPosition} on tab list "${tabListId}" is not visible`);
});

Then('I should not see the mute button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsNotVisible(world, TabContextMenuButtons.MUTE, 'mute', tabListId, tabPosition);
});

Then('I should see the mute button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsVisible(world, TabContextMenuButtons.MUTE, 'mute', tabListId, tabPosition);
});

Then('I should not see the unmute button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsNotVisible(world, TabContextMenuButtons.UNMUTE, 'unmute', tabListId, tabPosition);
});

Then('I should see the unmute button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsVisible(world, TabContextMenuButtons.UNMUTE, 'unmute', tabListId, tabPosition);
});

Then('I should not see the pin button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsNotVisible(world, TabContextMenuButtons.PIN, 'pin', tabListId, tabPosition);
});

Then('I should see the pin button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsVisible(world, TabContextMenuButtons.PIN, 'pin', tabListId, tabPosition);
});

Then('I should not see the unpin button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsNotVisible(world, TabContextMenuButtons.UNPIN, 'unpin', tabListId, tabPosition);
});

Then('I should see the unpin button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsVisible(world, TabContextMenuButtons.UNPIN, 'unpin', tabListId, tabPosition);
});

Then('I should not see the discard button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsNotVisible(world, TabContextMenuButtons.DISCARD, 'discard', tabListId, tabPosition);
});

Then('I should see the discard button on the tab context menu of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    await TabAssertions.assertThatTabContextMenuButtonIsVisible(world, TabContextMenuButtons.DISCARD, 'discard', tabListId, tabPosition);
});

Then('I should not see the move above button on the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabMoveAboveButtonElement(tab);

    await webdriver.wait(async () => {
        return !await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab move above button is visible');
});

Then('I should see the move above button on the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabMoveAboveButtonElement(tab);

    await webdriver.wait(async () => {
        return await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab move above button is not visible');
});

Then('I should not see the move above button on the sticky focused tab', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getStickyFocusedTab();
    const buttonElement = openedTabListSupport.getTabMoveAboveButtonElement(tab);

    await webdriver.wait(async () => {
        return !await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sticky focused tab move above button is visible');
});

Then('the tab {int} on the tab list {string} should be visible in the viewport', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await webdriver.wait(async () => {
        return await TabAssertions.isUnpinnedTabFullyVisibleInViewport(world, tab);
    }, world.defaultWaitTimeout, `Unpinned tab at position ${tabPosition} on tab list "${tabListId}" is not fully visible in the viewport`);
});

Then('the title of the tab {int} on the tab list {string} should not be clickable', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const titleContainer = openedTabListSupport.getTabTitleContainerElement(tab);
    await browserSupport.throwErrorIfElementIsClickable(titleContainer, 'Tab title is clickable');
});

Then('the title of the tab {int} on the tab list {string} should be on one line', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const titleElement = openedTabListSupport.getTabTitleElement(tab);

    await webdriver.wait(async () => {
        return await browserSupport.isElementTextOnOneLine(titleElement);
    }, world.defaultWaitTimeout, 'Tab title is not on one line');
});

Then('the title of the tab {int} on the tab list {string} should be on several lines', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const titleElement = openedTabListSupport.getTabTitleElement(tab);

    await webdriver.wait(async () => {
        return !await browserSupport.isElementTextOnOneLine(titleElement);
    }, world.defaultWaitTimeout, 'Tab title is not on several lines');
});

Then('the url of the tab {int} on the tab list {string} should be on one line', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const urlElement = openedTabListSupport.getTabUrlElement(tab);

    await webdriver.wait(async () => {
        return await urlElement.isDisplayed() && await browserSupport.isElementTextOnOneLine(urlElement);
    }, world.defaultWaitTimeout, 'Tab url is not on one line');
});

Then('the url of the tab {int} on the tab list {string} should be on several lines', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;
    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const urlElement = openedTabListSupport.getTabUrlElement(tab);

    await webdriver.wait(async () => {
        return await urlElement.isDisplayed() && !await browserSupport.isElementTextOnOneLine(urlElement);
    }, world.defaultWaitTimeout, 'Tab url is not on several lines');
});

class TabAssertions {
    static async assertTab(world: World, tabListId: string, tabPosition: number, expectedTestPageName: string) {
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const openedTabListSupport = world.openedTabListSupport;
        const testPageDescriptor = world.testPageDescriptorRetriever.getDescriptor(expectedTestPageName as TestPageNames);

        let tab: WebElement;
        const expectedTitle = testPageDescriptor.title;
        await webdriverHelper.wait(
            async () => {
                tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

                return this.isTabTitleEqualTo(world, tab, expectedTitle);
            },
            world.defaultWaitTimeout,
            async () => {
                const actualTitle = await this.getTabTitle(world, tab);

                return !!tab
                    ? `Tab title "${actualTitle}" is different than expected "${expectedTitle}"`
                    : `Tab at position ${tabPosition} on tab list "${tabListId}" does not exists`
                ;
            },
        );

        await this.assertTabTitleTooltip(world, tab, testPageDescriptor.title);
        await this.assertTabUrl(world, tab, testPageDescriptor.url);
        await this.assertTabDomain(world, tab, testPageDescriptor.domain);
        await this.assertTabFavicon(world, tab, testPageDescriptor.faviconUrl);
    }

    static async assertStickyFocusedTab(world: World, expectedTestPageName: string) {
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const openedTabListSupport = world.openedTabListSupport;
        const testPageDescriptor = world.testPageDescriptorRetriever.getDescriptor(expectedTestPageName as TestPageNames);

        let tab: WebElement;
        const expectedTitle = testPageDescriptor.title;
        await webdriverHelper.wait(
            async () => {
                tab = await openedTabListSupport.getStickyFocusedTab();

                return this.isTabTitleEqualTo(world, tab, expectedTitle);
            },
            world.defaultWaitTimeout,
            async () => {
                const actualTitle = !!tab && await this.getTabTitle(world, tab);

                return !!tab
                    ? `Sticky focused tab title "${actualTitle}" is different than expected "${expectedTitle}"`
                    : `Sticky focused tab does not exists`
                ;
            }
        );

        await this.assertTabTitleTooltip(world, tab, testPageDescriptor.title);
        await this.assertTabFavicon(world, tab, testPageDescriptor.faviconUrl);
    }

    private static async isTabTitleEqualTo(world: World, tab: WebElement, expectedTitle: string) {
        const actualTitle = await this.getTabTitle(world, tab);

        return expectedTitle == actualTitle;
    }

    private static async getTabTitle(world: World, tab: WebElement) {
        return world.openedTabListSupport.getTabTitle(tab);
    }

    static async assertTabTitleTooltip(world: World, tab: WebElement, expectedTitle: string) {
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const openedTabListSupport = world.openedTabListSupport;

        let actualTitle: string;
        await webdriverHelper.wait(async () => {
            actualTitle = await openedTabListSupport.getTabTitleTooltip(tab);

            return expectedTitle == actualTitle;
        }, world.defaultWaitTimeout, () => `Tab title tooltip "${actualTitle}" is different than expected "${expectedTitle}"`);
    }

    static async assertTabUrl(world: World, tab: WebElement, expectedUrl: string) {
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const openedTabListSupport = world.openedTabListSupport;

        let actualUrl: string;
        await webdriverHelper.wait(async () => {
            actualUrl = await openedTabListSupport.getTabUrl(tab);

            return expectedUrl == actualUrl;
        }, world.defaultWaitTimeout, () => `Tab url "${actualUrl}" is different than expected "${expectedUrl}"`);
    }

    static async assertTabDomain(world: World, tab: WebElement, expectedDomain: string) {
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const openedTabListSupport = world.openedTabListSupport;

        let actualDomain: string;
        await webdriverHelper.wait(async () => {
            actualDomain = await openedTabListSupport.getTabUrlDomain(tab);

            return expectedDomain == actualDomain;
        }, world.defaultWaitTimeout, () => `Tab domain "${actualDomain}" is different than expected "${expectedDomain}"`);
    }

    static async assertTabFavicon(world: World, tab: WebElement, expectedFaviconUrl: string) {
        const testPageDescriptorRetriever = world.testPageDescriptorRetriever;
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const openedTabListSupport = world.openedTabListSupport;

        let actualFaviconUrl: string;
        await webdriverHelper.wait(async () => {
            const actualFaviconDataUri = await openedTabListSupport.getTabFaviconUrl(tab);
            actualFaviconUrl = await testPageDescriptorRetriever.getFaviconUrlFromDataUri(actualFaviconDataUri);

            return expectedFaviconUrl == actualFaviconUrl;
        }, world.defaultWaitTimeout, () => `Tab favicon url "${actualFaviconUrl}" is different than expected "${expectedFaviconUrl}"`);
    }

    static async isUnpinnedTabFullyVisibleInViewport(world: World, tab: WebElement) {
        const browserSupport = world.browserSupport;
        const openedTabListSupport = world.openedTabListSupport;
        const unpinnedTabsListElement = openedTabListSupport.getUnpinnedTabsListElement();

        return browserSupport.isElementFullyContainedInContainerElement(tab, unpinnedTabsListElement);
    }

    static async assertThatTabContextMenuButtonIsNotVisible(world: World, buttonName: TabContextMenuButtons, buttonLabel: string, tabListId: string, tabPosition: number) {
        const openedTabListSupport = world.openedTabListSupport;
        const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
        const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, buttonName);

        await this.openTabContextMenu(world, tab, tabListId, tabPosition);
        await this.waitThatTabContextMenuIsVisible(world, tab, tabListId, tabPosition);

        if (await buttonElement.isDisplayed()) {
            throw new Error(`Tab context menu ${buttonLabel} button of tab at position ${tabPosition} of tab list "${tabListId}" is visible`);
        }
    }

    static async assertThatTabContextMenuButtonIsVisible(world: World, buttonName: TabContextMenuButtons, buttonLabel: string, tabListId: string, tabPosition: number) {
        const openedTabListSupport = world.openedTabListSupport;
        const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
        const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, buttonName);

        await this.openTabContextMenu(world, tab, tabListId, tabPosition);
        await this.waitThatTabContextMenuIsVisible(world, tab, tabListId, tabPosition);

        if (!await buttonElement.isDisplayed()) {
            throw new Error(`Tab context menu ${buttonLabel} button of tab at position ${tabPosition} of tab list "${tabListId}" is not visible`);
        }
    }

    private static async openTabContextMenu(world: World, tab: WebElement, tabListId: string, tabPosition: number) {
        const openedTabListSupport = world.openedTabListSupport;
        const contextMenu = openedTabListSupport.getTabContextMenuElement(tab);
        const titleElement = openedTabListSupport.getTabTitleElement(tab);

        if (!await contextMenu.isDisplayed()) {
            await world.browserSupport.contextClickElementOnceAvailable(
                titleElement,
                `Tab context menu of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`,
            );
        }
    }

    private static async waitThatTabContextMenuIsVisible(world: World, tab: WebElement, tabListId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const openedTabListSupport = world.openedTabListSupport;
        const contextMenu = openedTabListSupport.getTabContextMenuElement(tab);

        await webdriver.wait(async () => {
            return contextMenu.isDisplayed();
        }, world.defaultWaitTimeout, `Tab context menu of tab at position ${tabPosition} of tab list "${tabListId}" is not visible`);
    }
}
