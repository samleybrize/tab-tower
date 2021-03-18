import { Then } from 'cucumber';
import { World } from '../support/world';

Then('I should see the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const sidenavSupport = world.sidenavSupport;

    const sidenavElement = sidenavSupport.getViewElement();

    await webdriver.wait(async () => {
        return await sidenavElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sidenav is not visible');
});

Then('I should not see the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const sidenavSupport = world.sidenavSupport;

    const sidenavElement = sidenavSupport.getViewElement();

    await webdriver.wait(async () => {
        return !await sidenavElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Sidenav is visible');
});

Then('I should see that "all opened tabs" is marked as active on the sidenav', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const rowElement = sidenavSupport.getAllOpenedTabsButtonElement();

    await webdriverHelper.wait(async () => {
        return await sidenavSupport.isButtonMarkedAsActive(rowElement);
    }, world.defaultWaitTimeout, '"all opened tabs" is not marked as active on the sidenav');
});

Then('I should see that the tag {int} is marked as active on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');

    await webdriverHelper.wait(async () => {
        return await sidenavSupport.isButtonMarkedAsActive(tagElement);
    }, world.defaultWaitTimeout, `Tag "${tagPosition}" is not marked as active on the sidenav`);
});

Then('I should not see that no tag matches tag search on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const sidenavSupport = world.sidenavSupport;

    const noTagMatchesSearchElement = sidenavSupport.getNoTagMatchesTagSearchElement();

    await webdriver.wait(async () => {
        return !await noTagMatchesSearchElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The no tag matches tag search message is visible');
});

Then('I should see that no tag matches tag search on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const sidenavSupport = world.sidenavSupport;

    const noTagMatchesSearchElement = sidenavSupport.getNoTagMatchesTagSearchElement();

    await webdriver.wait(async () => {
        return await noTagMatchesSearchElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The no tag matches tag search message is not visible');
});

Then('I should see {int} visible tag(s) in the sidenav', async function(expectedNumberOfTags: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    let actualNumberOfTags = 0;
    await webdriverHelper.wait(async () => {
        const tagElementList = await sidenavSupport.getAllTagElements();

        if (tagElementList.length < expectedNumberOfTags) {
            return false;
        }

        actualNumberOfTags = await browserSupport.getNumberOfVisibleElements(tagElementList);

        return actualNumberOfTags === expectedNumberOfTags;
    }, world.defaultWaitTimeout, () => `Number of visible tab tags "${actualNumberOfTags}" in the sidenav is different than expected "${expectedNumberOfTags}"`);
});

Then('I should see the tag {int} with the label {string} in the sidenav', async function(tagPosition: number, expectedLabel: string) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');

    let actualLabel: string = null;
    await webdriverHelper.wait(async () => {
        actualLabel = await sidenavSupport.getTagLabel(tagElement);

        return actualLabel === expectedLabel;
    }, world.defaultWaitTimeout, () => `Tag label "${actualLabel}" in the sidenav is different than expected "${expectedLabel}"`);
});

Then('I should see the tag {int} with the color {int} in the sidenav', async function(tagPosition: number, expectedColorId: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');

    let actualColorId = 0;
    await webdriverHelper.wait(async () => {
        actualColorId = await sidenavSupport.getTagColorId(tagElement);

        return actualColorId === expectedColorId;
    }, world.defaultWaitTimeout, () => `Tag color id "${actualColorId}" in the sidenav is different than expected "${expectedColorId}"`);
});

Then('I should see the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const deleteConfirmationElement = sidenavSupport.getTagDeleteConfirmationBoxElement(tagElement);

    await webdriverHelper.wait(async () => {
        return await deleteConfirmationElement.isDisplayed();
    }, world.defaultWaitTimeout, `Tag delete confirmation box of the tag "${tagPosition}" in the sidenav is not visible`);
});

Then('I should not see the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const deleteConfirmationElement = sidenavSupport.getTagDeleteConfirmationBoxElement(tagElement);

    await webdriverHelper.wait(async () => {
        return !await deleteConfirmationElement.isDisplayed();
    }, world.defaultWaitTimeout, `Tag delete confirmation box of the tag "${tagPosition}" in the sidenav is visible`);
});

Then('the context menu of the tag {int} on the sidenav should be visible', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const contextMenuElement = sidenavSupport.getTagContextMenuElement(tagElement);

    await webdriverHelper.wait(async () => {
        return await contextMenuElement.isDisplayed();
    }, world.defaultWaitTimeout, `Tag context menu of the tag "${tagPosition}" in the sidenav is not visible`);
});

Then('the context menu of the tag {int} on the sidenav should not be visible', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const contextMenuElement = sidenavSupport.getTagContextMenuElement(tagElement);

    await webdriverHelper.wait(async () => {
        return !await contextMenuElement.isDisplayed();
    }, world.defaultWaitTimeout, `Tag context menu of the tag "${tagPosition}" in the sidenav is visible`);
});
