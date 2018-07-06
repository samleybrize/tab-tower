import { Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

Then('I should see the current workspace with label {string} and {int} tab(s) indicated', async function(expectedLabel: string, expectedNumberOfTabs: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const labelElement = webdriver.findElement(By.css('.current-workspace .name'));
    const numberOfTabsElement = webdriver.findElement(By.css('.current-workspace .number-of-tabs'));

    let actualLabel: string;
    await webdriverHelper.wait(async () => {
        actualLabel = await labelElement.getText();

        return actualLabel === expectedLabel;
    }, 10000, () => `Current workspace label "${actualLabel}" is different than expected "${expectedLabel}"`);

    let actualNumberOfTabs: string;
    await webdriverHelper.wait(async () => {
        actualNumberOfTabs = await numberOfTabsElement.getText();

        return actualNumberOfTabs === '' + expectedNumberOfTabs;
    }, 10000, () => `Current workspace number of tabs "${actualNumberOfTabs}" is different than expected "${expectedNumberOfTabs}"`);
});

Then('the general tab selector should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const checkboxElement = webdriver.findElement(By.css('.tab-list .general-tab-selector input'));
    const checkedIconElement = webdriver.findElement(By.css('.tab-list .general-tab-selector .checked'));
    const uncheckedIconElement = webdriver.findElement(By.css('.tab-list .general-tab-selector .unchecked'));

    await webdriver.wait(async () => {
        return !await checkedIconElement.isDisplayed() && await uncheckedIconElement.isDisplayed() && !await checkboxElement.isSelected();
    }, 10000, 'The general tab selector is marked as selected');
});

Then('the general tab selector should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const checkboxElement = webdriver.findElement(By.css('.tab-list .general-tab-selector input'));
    const checkedIconElement = webdriver.findElement(By.css('.tab-list .general-tab-selector .checked'));
    const uncheckedIconElement = webdriver.findElement(By.css('.tab-list .general-tab-selector .unchecked'));

    await webdriver.wait(async () => {
        return await checkedIconElement.isDisplayed() && !await uncheckedIconElement.isDisplayed() && await checkboxElement.isSelected();
    }, 10000, 'The general tab selector is not marked as selected');
});

Then('the selected tabs actions button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const selectedTabsActionsButton = webdriver.findElement(By.css('.selected-tabs-actions-button'));

    await webdriver.wait(async () => {
        return !await selectedTabsActionsButton.isDisplayed();
    }, 10000, `Selected tabs actions button is visible`);
});

Then('the selected tabs actions button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const selectedTabsActionsButton = webdriver.findElement(By.css('.selected-tabs-actions-button'));

    await webdriver.wait(async () => {
        return await selectedTabsActionsButton.isDisplayed() && !await TabSupport.hasCssClass(selectedTabsActionsButton, 'hide');
    }, 10000, `Selected tabs actions button is not visible`);
});

Then('the selected tabs actions context menu should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const contextMenu = webdriver.findElement(By.css('.selected-tabs-actions-context-menu-container .context-menu'));

    await webdriver.wait(async () => {
        return !await contextMenu.isDisplayed();
    }, 10000, `Selected tabs actions context menu is visible`);
});

Then('the selected tabs actions context menu should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const contextMenu = webdriver.findElement(By.css('.selected-tabs-actions-context-menu-container .context-menu'));

    await webdriver.wait(async () => {
        return await contextMenu.isDisplayed();
    }, 10000, `Selected tabs actions context menu is not visible`);
});
