import { Then } from 'cucumber';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

Then('I should see the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const sidenavElement = webdriver.findElement(By.css('.sidenav'));

    await webdriverHelper.wait(async () => {
        return await sidenavElement.isDisplayed();
    }, 10000, 'Sidenav is not visible');
});

Then('I should not see the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const sidenavElement = webdriver.findElement(By.css('.sidenav'));

    await webdriverHelper.wait(async () => {
        return !await sidenavElement.isDisplayed();
    }, 10000, 'Sidenav is visible');
});

Then('I should see that "all opened tabs" is marked as active on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const rowElement = webdriver.findElement(By.css('.sidenav .all-opened-tabs'));

    await webdriverHelper.wait(async () => {
        // TODO TabSupport ?
        return await TabSupport.hasCssClass(rowElement, 'active');
    }, 10000, '"all opened tabs" is not marked as active on the sidenav');
});

Then('I should see that the tag {int} is marked as active on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tagElement = await getTagAtPosition(webdriver, tagPosition);

    await webdriverHelper.wait(async () => {
        // TODO TabSupport ?
        return await TabSupport.hasCssClass(tagElement, 'active');
    }, 10000, `Tag "${tagPosition}" is not marked as active on the sidenav`);
});

Then('I should not see that no tag matches tag search on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const noTagMatchesSearchElement = webdriver.findElement(By.css(`.sidenav .tab-tag-list .no-tag-matches-search`));

    await webdriver.wait(async () => {
        return !await noTagMatchesSearchElement.isDisplayed();
    }, 10000, 'The no tag matches tag search message is visible');
});

Then('I should see that no tag matches tag search on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const noTagMatchesSearchElement = webdriver.findElement(By.css(`.sidenav .tab-tag-list .no-tag-matches-search`));

    await webdriver.wait(async () => {
        return await noTagMatchesSearchElement.isDisplayed();
    }, 10000, 'The no tag matches tag search message is not visible');
});

Then('I should see {int} visible tag(s) in the sidenav', async function(expectedNumberOfTags: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    let actualNumberOfTags = 0;

    await webdriverHelper.wait(async () => {
        const tagElementList = await webdriver.findElements(By.css('.sidenav .tab-tag-list .tab-tag'));
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
    }, 10000, () => `Number of visible tab tags "${actualNumberOfTags}" in the sidenav is different than expected "${expectedNumberOfTags}"`);
});

Then('I should see the tag {int} with the label {string} in the sidenav', async function(tagIndex: number, expectedLabel: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagIndex);
    let actualLabel: string = null;

    await webdriverHelper.wait(async () => {
        actualLabel = await tagElement.findElement(By.css('.label')).getText();

        return actualLabel === expectedLabel;
    }, 10000, () => `Tag label "${actualLabel}" in the sidenav is different than expected "${expectedLabel}"`);
});

Then('I should see the tag {int} with the color {int} in the sidenav', async function(tagPosition: number, expectedColorId: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    let actualColorId = 0;

    await webdriverHelper.wait(async () => {
        actualColorId = +await tagElement.getAttribute('data-color');

        return actualColorId === expectedColorId;
    }, 10000, () => `Tag color id "${actualColorId}" in the sidenav is different than expected "${expectedColorId}"`);
});

Then('I should see the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const deleteConfirmationElement = await tagElement.findElement(By.css('.delete-confirmation'));

    await webdriverHelper.wait(async () => {
        return await deleteConfirmationElement.isDisplayed();
    }, 10000, `Tag delete confirmation box of the tag "${tagPosition}" in the sidenav is not visible`);
});

Then('I should not see the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const deleteConfirmationElement = await tagElement.findElement(By.css('.delete-confirmation'));

    await webdriverHelper.wait(async () => {
        return !await deleteConfirmationElement.isDisplayed();
    }, 10000, `Tag delete confirmation box of the tag "${tagPosition}" in the sidenav is visible`);
});

Then('the context menu of the tag {int} on the sidenav should be visible', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const contextMenuElement = tagElement.findElement(By.css('.context-menu'));

    await webdriverHelper.wait(async () => {
        return await contextMenuElement.isDisplayed();
    }, 10000, `Tag context menu of the tag "${tagPosition}" in the sidenav is not visible`);
});

Then('the context menu of the tag {int} on the sidenav should not be visible', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const contextMenuElement = tagElement.findElement(By.css('.context-menu'));

    await webdriverHelper.wait(async () => {
        return !await contextMenuElement.isDisplayed();
    }, 10000, `Tag context menu of the tag "${tagPosition}" in the sidenav is visible`);
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
        const tagList = await webdriver.findElements(By.css(`.sidenav .tab-tag-list .tab-tag${includeTagSelector}`));
        tag = tagList[tagPosition];

        return !!tag;
    }, 10000, `Tag at position ${tagPosition} on the sidenav does not exists`);

    return tag;
}
