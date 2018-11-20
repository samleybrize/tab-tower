import { Then, When } from 'cucumber';
import { By } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

When('I type {string} in the tag label input', async function(inputText: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-tag-edit .label input'));
    await inputElement.clear();
    await inputElement.sendKeys(inputText);
});

When('I clear the tag label input', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-tag-edit .label input'));
    await inputElement.clear();
});

When('I select the color {int} on the tag form', async function(colorId: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const colorElement = webdriver.findElement(By.css(`.tab-tag-edit .color-selector label.color-${colorId}`));
    await colorElement.click();
});

When('I click on the tag save button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const buttonElement = webdriver.findElement(By.css('.tab-tag-edit .submit'));
    await buttonElement.click();
});

When('I click on the tab tag form back button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const buttonElement = webdriver.findElement(By.css('.tab-tag-edit .cancel-button'));
    await buttonElement.click();
});

Then('I should see the create tag form', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const containerElement = webdriver.findElement(By.css('.tab-tag-edit'));

    await webdriverHelper.wait(async () => {
        return await containerElement.isDisplayed();
    }, 10000, 'The tab tag form is not visible');

    const titleElement = webdriver.findElement(By.css('.tab-tag-edit .title'));
    const expectedTitle = 'Create a tag';
    const actualTitle = await titleElement.getText();

    if (expectedTitle !== actualTitle) {
        throw new Error(`Tab tag form title "${actualTitle}" is different than expected "${expectedTitle}"`);
    }
});

Then('I should not see the create tag form', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const containerElement = webdriver.findElement(By.css('.tab-tag-edit'));

    await webdriverHelper.wait(async () => {
        return !await containerElement.isDisplayed();
    }, 10000, 'The tab tag form is visible');
});

Then('I should see the edit tag form', async function() {
    // TODO mix with "create"
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const containerElement = webdriver.findElement(By.css('.tab-tag-edit'));

    await webdriverHelper.wait(async () => {
        return await containerElement.isDisplayed();
    }, 10000, 'The tab tag form is not visible');

    const titleElement = webdriver.findElement(By.css('.tab-tag-edit .title'));
    const expectedTitle = 'Edit a tag';
    const actualTitle = await titleElement.getText();

    if (expectedTitle !== actualTitle) {
        throw new Error(`Tab tag form title "${actualTitle}" is different than expected "${expectedTitle}"`);
    }
});

Then('I should not see the edit tag form', async function() {
    // TODO mix with "create"
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const containerElement = webdriver.findElement(By.css('.tab-tag-edit'));

    await webdriverHelper.wait(async () => {
        return !await containerElement.isDisplayed();
    }, 10000, 'The tab tag form is visible');
});

Then('the tag label input should be focused', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const inputElement = await webdriver.findElement(By.css('.tab-tag-edit .label input'));

    await webdriverHelper.wait(async () => {
        const focusedElement = await webdriver.switchTo().activeElement();

        return inputElement !== focusedElement;
    }, 10000, 'The tag label input is not focused');
});

Then('the tag label input should be empty', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-tag-edit .label input'));
    const inputValue = await inputElement.getAttribute('value');

    if ('' != inputValue) {
        throw new Error('Tag label input is not empty');
    }
});

Then('the tag label input should contain {string}', async function(expectedText: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-tag-edit .label input'));
    const inputValue = await inputElement.getAttribute('value');

    if (expectedText != inputValue) {
        throw new Error(`Tag label input value "${inputValue}" is different than expected "${expectedText}"`);
    }
});

Then('the tag label input should be marked as invalid', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const inputElement = webdriver.findElement(By.css('.tab-tag-edit .label input'));

    await webdriverHelper.wait(async () => {
        // TODO TabSupport ??
        return await TabSupport.hasCssClass(inputElement, 'invalid');
    }, 10000, 'The tag label input is not marked as invalid');
});

Then('the tag label input should not be marked as invalid', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const inputElement = webdriver.findElement(By.css('.tab-tag-edit .label input'));

    await webdriverHelper.wait(async () => {
        // TODO TabSupport ??
        return !await TabSupport.hasCssClass(inputElement, 'invalid');
    }, 10000, 'The tag label input is marked as invalid');
});
