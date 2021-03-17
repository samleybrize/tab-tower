import { Then } from 'cucumber';
import { By, error as WebDriverError } from 'selenium-webdriver';
import { World } from '../support/world';

Then('I should see the current tab list with label {string} and {int} tab(s) indicated', async function(expectedLabel: string, expectedNumberOfTabs: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabsViewSupport = world.tabsViewSupport;

    let actualLabel: string;
    await webdriverHelper.wait(async () => {
        actualLabel = await tabsViewSupport.getCurrentTabListLabel();

        return actualLabel === expectedLabel;
    }, world.defaultWaitTimeout, () => `Current tab list label "${actualLabel}" is different than expected "${expectedLabel}"`);

    let actualNumberOfTabs: number;
    await webdriverHelper.wait(async () => {
        actualNumberOfTabs = await tabsViewSupport.getCurrentTabListNumberOfTabs();

        return actualNumberOfTabs === expectedNumberOfTabs;
    }, world.defaultWaitTimeout, () => `Current tab list number of tabs "${actualNumberOfTabs}" is different than expected "${expectedNumberOfTabs}"`);
});

Then('I should see the clear tab filter button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;

    const clearInputElement = tabsViewSupport.getTabFilterClearInputElement();

    await webdriver.wait(async () => {
        return await clearInputElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab filter button is not visible');
});

Then('I should not see the clear tab filter button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;

    const clearInputElement = tabsViewSupport.getTabFilterClearInputElement();

    await webdriver.wait(async () => {
        return !await clearInputElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab filter button is visible');
});

Then('the general tab selector should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;

    await webdriver.wait(async () => {
        return tabsViewSupport.isGeneralTabSelectorUnchecked();
    }, world.defaultWaitTimeout, 'The general tab selector is marked as selected');
});

Then('the general tab selector should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;

    await webdriver.wait(async () => {
        return tabsViewSupport.isGeneralTabSelectorChecked();
    }, world.defaultWaitTimeout, 'The general tab selector is not marked as selected');
});

Then('the general tab selector should not be clickable', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const generalTabSelectorElement = tabsViewSupport.getGeneralTabSelectorClickableElement();
    await browserSupport.throwErrorIfElementIsClickable(generalTabSelectorElement, 'The general tab selector is clickable');
});

Then('the new tab button should not be clickable', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const newTabButtonElement = tabsViewSupport.getNewTabButtonElement();
    await browserSupport.throwErrorIfElementIsClickable(newTabButtonElement, 'The new tab button is clickable');
});

Then('the selected tabs actions button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const selectedTabsActionsButton = tabsViewSupport.getSelectedTabsActionsButtonElement();

    await webdriver.wait(async () => {
        return !await selectedTabsActionsButton.isDisplayed();
    }, world.defaultWaitTimeout, `Selected tabs actions button is visible`);
});

Then('the selected tabs actions button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;
    const selectedTabsActionsButton = tabsViewSupport.getSelectedTabsActionsButtonElement();

    await webdriver.wait(async () => {
        return await selectedTabsActionsButton.isDisplayed() && !await browserSupport.hasCssClass(selectedTabsActionsButton, 'hide');
    }, world.defaultWaitTimeout, `Selected tabs actions button is not visible`);
});

Then('the selected tabs actions context menu should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const contextMenu = tabsViewSupport.getSelectedTabsContextMenuElement();

    await webdriver.wait(async () => {
        return !await contextMenu.isDisplayed();
    }, world.defaultWaitTimeout, `Selected tabs actions context menu is visible`);
});

Then('the selected tabs actions context menu should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const contextMenu = tabsViewSupport.getSelectedTabsContextMenuElement();

    await webdriver.wait(async () => {
        return await contextMenu.isDisplayed();
    }, world.defaultWaitTimeout, `Selected tabs actions context menu is not visible`);
});

Then('the move below all button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const buttonElement = tabsViewSupport.getMoveBelowAllButtonElement();

    await webdriver.wait(async () => {
        return !await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, `The move tab below all button is visible`);
});

Then('the move below all button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const buttonElement = tabsViewSupport.getMoveBelowAllButtonElement();

    await webdriver.wait(async () => {
        return await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, `The move tab below all button is not visible`);
});

Then('the cancel tab move button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const buttonElement = tabsViewSupport.getCancelTabMoveButtonElement();

    await webdriver.wait(async () => {
        return !await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, `The cancel tab move button is visible`);
});

Then('the cancel tab move button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;
    const buttonElement = tabsViewSupport.getCancelTabMoveButtonElement();

    await webdriver.wait(async () => {
        return await buttonElement.isDisplayed();
    }, world.defaultWaitTimeout, `The cancel tab move button is not visible`);
});
