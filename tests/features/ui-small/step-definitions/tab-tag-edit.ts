import { Then, When } from 'cucumber';
import { World } from '../support/world';

When('I type {string} in the tag label input', async function(inputText: string) {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const inputElement = tabTagEditSupport.getLabelInputElement();
    await inputElement.clear();
    await inputElement.sendKeys(inputText);
});

When('I clear the tag label input', async function() {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const inputElement = tabTagEditSupport.getLabelInputElement();
    await inputElement.clear();
});

When('I select the color {int} on the tag form', async function(colorId: number) {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const colorElement = tabTagEditSupport.getColorButtonElement(colorId);
    await colorElement.click();
});

When('I click on the tag save button', async function() {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const buttonElement = tabTagEditSupport.getSubmitButtonElement();
    await buttonElement.click();
});

When('I click on the tab tag form back button', async function() {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const buttonElement = tabTagEditSupport.getCancelButtonElement();
    await buttonElement.click();
});

Then('I should see the create tag form', async function() {
    const world = this as World;
    await assertViewIsVisible(world, 'Create a tag');
});

Then('I should not see the create tag form', async function() {
    const world = this as World;
    await assertViewIsNotVisible(world);
});

Then('I should see the edit tag form', async function() {
    const world = this as World;
    await assertViewIsVisible(world, 'Edit a tag');
});

Then('I should not see the edit tag form', async function() {
    const world = this as World;
    await assertViewIsNotVisible(world);
});

Then('the tag label input should be focused', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagEditSupport = world.tabTagEditSupport;

    const inputElement = tabTagEditSupport.getLabelInputElement();

    await webdriver.wait(async () => {
        const focusedElement = await webdriver.switchTo().activeElement();

        return inputElement !== focusedElement;
    }, world.defaultWaitTimeout, 'The tag label input is not focused');
});

Then('the tag label input should be empty', async function() {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const inputValue = await tabTagEditSupport.getLabelInputValue();

    if ('' != inputValue) {
        throw new Error('Tag label input is not empty');
    }
});

Then('the tag label input should contain {string}', async function(expectedText: string) {
    const world = this as World;
    const tabTagEditSupport = world.tabTagEditSupport;

    const inputValue = await tabTagEditSupport.getLabelInputValue();

    if (expectedText != inputValue) {
        throw new Error(`Tag label input value "${inputValue}" is different than expected "${expectedText}"`);
    }
});

Then('the tag label input should be marked as invalid', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagEditSupport = world.tabTagEditSupport;

    await webdriver.wait(async () => {
        return await tabTagEditSupport.isLabelInputMarkedAsInvalid();
    }, world.defaultWaitTimeout, 'The tag label input is not marked as invalid');
});

Then('the tag label input should not be marked as invalid', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagEditSupport = world.tabTagEditSupport;

    await webdriver.wait(async () => {
        return !await tabTagEditSupport.isLabelInputMarkedAsInvalid();
    }, world.defaultWaitTimeout, 'The tag label input is marked as invalid');
});

async function assertViewIsVisible(world: World, expectedTitle: string) {
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagEditSupport = world.tabTagEditSupport;

    const containerElement = tabTagEditSupport.getViewElement();

    await webdriver.wait(async () => {
        return await containerElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The tab tag form is not visible');

    const actualTitle = await tabTagEditSupport.getViewTitle();

    if (expectedTitle !== actualTitle) {
        throw new Error(`Tab tag form title "${actualTitle}" is different than expected "${expectedTitle}"`);
    }
}

async function assertViewIsNotVisible(world: World) {
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagEditSupport = world.tabTagEditSupport;

    const containerElement = tabTagEditSupport.getViewElement();

    await webdriver.wait(async () => {
        return !await containerElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The tab tag form is visible');
}
