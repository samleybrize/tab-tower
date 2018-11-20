import { Then } from 'cucumber';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';
import { World } from '../support/world';

Then('I should see the tab tag management view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabTagManagementElement = webdriver.findElement(By.css('.tab-tag-assign'));

    await webdriverHelper.wait(async () => {
        return await tabTagManagementElement.isDisplayed();
    }, 10000, 'Tab tag management view is not visible');
});

Then('I should not see the tab tag management view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabTagManagementElement = webdriver.findElement(By.css('.tab-tag-assign'));

    await webdriverHelper.wait(async () => {
        return !await tabTagManagementElement.isDisplayed();
    }, 10000, 'Tab tag management view is visible');
});

Then('I should not see that no tag matches tag search on the tab tag management view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const noTagMatchesSearchElement = webdriver.findElement(By.css(`.tab-tag-assign .no-tag-matches-search`));

    await webdriver.wait(async () => {
        return !await noTagMatchesSearchElement.isDisplayed();
    }, 10000, 'The no tag matches tag search message is visible');
});

Then('I should see that no tag matches tag search on the tab tag management view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const noTagMatchesSearchElement = webdriver.findElement(By.css(`.tab-tag-assign .no-tag-matches-search`));

    await webdriver.wait(async () => {
        return await noTagMatchesSearchElement.isDisplayed();
    }, 10000, 'The no tag matches tag search message is not visible');
});

Then('I should see {int} visible tag(s) in the tab tag management view', async function(expectedNumberOfTags: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    let actualNumberOfTags = 0;

    await webdriverHelper.wait(async () => {
        const tagElementList = await webdriver.findElements(By.css('.tab-tag-assign .tab-tag'));
        actualNumberOfTags = 0;

        for (const tagElement of tagElementList) {
            try {
                if (await tagElement.isDisplayed()) {
                    actualNumberOfTags++;
                }
            } catch (error) {
                if (!(error instanceof WebDriverError.StaleElementReferenceError)) {
                    throw error;
                }
            }
        }

        return actualNumberOfTags === expectedNumberOfTags;
    }, 10000, () => `Number of visible tab tags "${actualNumberOfTags}" in the tab tag management view is different than expected "${expectedNumberOfTags}"`);
});

Then('I should see the tag {int} with the label {string} in the tab tag management view', async function(tagIndex: number, expectedLabel: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagIndex);
    let actualLabel: string = null;

    await webdriverHelper.wait(async () => {
        actualLabel = await tagElement.findElement(By.css('.label')).getText();

        return actualLabel === expectedLabel;
    }, 10000, () => `Tag label "${actualLabel}" in the tab tag management view is different than expected "${expectedLabel}"`);
});

Then('I should see the tag {int} with the color {int} in the tab tag management view', async function(tagPosition: number, expectedColorId: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    let actualColorId = 0;

    await webdriverHelper.wait(async () => {
        actualColorId = +await tagElement.getAttribute('data-color');

        return actualColorId === expectedColorId;
    }, 10000, () => `Tag color id "${actualColorId}" in the tab tag management view is different than expected "${expectedColorId}"`);
});

Then('the tag {int} in the tab tag management view should be checked', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const checkboxContainer = tagElement.findElement(By.css('.checkbox'));

    const checkedElement = checkboxContainer.findElement(By.css('.checked-icon'));
    const uncheckedElement = checkboxContainer.findElement(By.css('.unchecked-icon'));
    const indeterminateElement = checkboxContainer.findElement(By.css('.indeterminate-icon'));

    await webdriverHelper.wait(async () => {
        return await checkedElement.isDisplayed() && !await uncheckedElement.isDisplayed() && !await indeterminateElement.isDisplayed();
    }, 10000, () => `The checkbox of the tag "${tagPosition}" in the tab tag management view is not checked`);
});

Then('the tag {int} in the tab tag management view should be unchecked', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const checkboxContainer = tagElement.findElement(By.css('.checkbox'));

    const checkedElement = checkboxContainer.findElement(By.css('.checked-icon'));
    const uncheckedElement = checkboxContainer.findElement(By.css('.unchecked-icon'));
    const indeterminateElement = checkboxContainer.findElement(By.css('.indeterminate-icon'));

    await webdriverHelper.wait(async () => {
        return !await checkedElement.isDisplayed() && await uncheckedElement.isDisplayed() && !await indeterminateElement.isDisplayed();
    }, 10000, () => `The checkbox of the tag "${tagPosition}" in the tab tag management view is not checked`);
});

Then('the tag {int} in the tab tag management view should be indeterminate', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const checkboxContainer = tagElement.findElement(By.css('.checkbox'));

    const checkedElement = checkboxContainer.findElement(By.css('.checked-icon'));
    const uncheckedElement = checkboxContainer.findElement(By.css('.unchecked-icon'));
    const indeterminateElement = checkboxContainer.findElement(By.css('.indeterminate-icon'));

    await webdriverHelper.wait(async () => {
        return !await checkedElement.isDisplayed() && !await uncheckedElement.isDisplayed() && await indeterminateElement.isDisplayed();
    }, 10000, () => `The checkbox of the tag "${tagPosition}" in the tab tag management view is not checked`);
});

async function getTagAtPosition(webdriver: WebDriver, tagPosition: number, condition?: 'visible'|'filtered') {
    let includeTagSelector = '';

    if ('filtered' == condition) {
        includeTagSelector = '.hide';
    } else {
        includeTagSelector = ':not(.hide)';
    }

    let tag: WebElement;
    await webdriver.wait(async () => {
        const tagList = await webdriver.findElements(By.css(`.tab-tag-assign .tab-tag${includeTagSelector}`));
        tag = tagList[tagPosition];

        return !!tag;
    }, 10000, `Tag at position ${tagPosition} on the tab tag management view does not exists`);

    return tag;
}
