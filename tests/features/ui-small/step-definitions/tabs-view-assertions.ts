import { Then } from 'cucumber';
import { By, error as WebDriverError } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

Then('I should see the current tab list with label {string} and {int} tab(s) indicated', async function(expectedLabel: string, expectedNumberOfTabs: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    let actualLabel: string;
    await webdriverHelper.wait(async () => {
        const labelElement = webdriver.findElement(By.css('.current-tab-list .name'));
        actualLabel = await labelElement.getText();

        return actualLabel === expectedLabel;
    }, 10000, () => `Current tab list label "${actualLabel}" is different than expected "${expectedLabel}"`);

    let actualNumberOfTabs: string;
    await webdriverHelper.wait(async () => {
        const numberOfTabsElement = webdriver.findElement(By.css('.current-tab-list .number-of-tabs'));
        actualNumberOfTabs = await numberOfTabsElement.getText();

        return actualNumberOfTabs === '' + expectedNumberOfTabs;
    }, 10000, () => `Current tab list number of tabs "${actualNumberOfTabs}" is different than expected "${expectedNumberOfTabs}"`);
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

Then('the general tab selector should not be clickable', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const generalTabSelectorElement = webdriver.findElement(By.css('.tab-list .general-tab-selector .checkbox-icon'));

    try {
        await generalTabSelectorElement.click();
    } catch (error) {
        if (error instanceof WebDriverError.ElementClickInterceptedError) {
            return;
        }

        throw error;
    }

    throw new Error('The general tab selector is clickable');
});

Then('the new tab button should not be clickable', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const newTabButtonElement = webdriver.findElement(By.css('.tab-list .new-tab-button'));

    try {
        await newTabButtonElement.click();
    } catch (error) {
        if (error instanceof WebDriverError.ElementClickInterceptedError) {
            return;
        }

        throw error;
    }

    throw new Error('The new tab button is clickable');
});

Then('the selected tabs actions button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const selectedTabsActionsButton = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-button i'));

    await webdriver.wait(async () => {
        return !await selectedTabsActionsButton.isDisplayed();
    }, 10000, `Selected tabs actions button is visible`);
});

Then('the selected tabs actions button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const selectedTabsActionsButton = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-button i'));

    await webdriver.wait(async () => {
        return await selectedTabsActionsButton.isDisplayed() && !await TabSupport.hasCssClass(selectedTabsActionsButton, 'hide');
    }, 10000, `Selected tabs actions button is not visible`);
});

Then('the selected tabs actions context menu should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const contextMenu = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .context-menu'));

    await webdriver.wait(async () => {
        return !await contextMenu.isDisplayed();
    }, 10000, `Selected tabs actions context menu is visible`);
});

Then('the selected tabs actions context menu should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const contextMenu = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .context-menu'));

    await webdriver.wait(async () => {
        return await contextMenu.isDisplayed();
    }, 10000, `Selected tabs actions context menu is not visible`);
});

Then('the move below all button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const buttonElement = webdriver.findElement(By.css('.tab-list .move-below-all-button'));

    await webdriver.wait(async () => {
        return !await buttonElement.isDisplayed();
    }, 10000, `The move tab below all button is visible`);
});

Then('the move below all button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const buttonElement = webdriver.findElement(By.css('.tab-list .move-below-all-button'));

    await webdriver.wait(async () => {
        return await buttonElement.isDisplayed();
    }, 10000, `The move tab below all button is not visible`);
});

Then('the cancel tab move button should not be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const buttonElement = webdriver.findElement(By.css('.tab-list .cancel-tab-move-button'));

    await webdriver.wait(async () => {
        return !await buttonElement.isDisplayed();
    }, 10000, `The cancel tab move button is visible`);
});

Then('the cancel tab move button should be visible', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const buttonElement = webdriver.findElement(By.css('.tab-list .cancel-tab-move-button'));

    await webdriver.wait(async () => {
        return await buttonElement.isDisplayed();
    }, 10000, `The cancel tab move button is not visible`);
});
