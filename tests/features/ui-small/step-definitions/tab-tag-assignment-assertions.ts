import { Then } from 'cucumber';
import { World } from '../support/world';

Then('I should see the tab tag assignment view', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const tabTagManagementElement = tabTagAssignmentSupport.getViewElement();

    await webdriverHelper.wait(async () => {
        return await tabTagManagementElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab tag management view is not visible');
});

Then('I should not see the tab tag assignment view', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const tabTagManagementElement = tabTagAssignmentSupport.getViewElement();

    await webdriverHelper.wait(async () => {
        return !await tabTagManagementElement.isDisplayed();
    }, world.defaultWaitTimeout, 'Tab tag management view is visible');
});

Then('I should not see that no tag matches tag search on the tab tag assignment view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const noTagMatchesSearchElement = tabTagAssignmentSupport.getNoTagMatchesTagSearchElement();

    await webdriver.wait(async () => {
        return !await noTagMatchesSearchElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The no tag matches tag search message is visible');
});

Then('I should see that no tag matches tag search on the tab tag assignment view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const noTagMatchesSearchElement = tabTagAssignmentSupport.getNoTagMatchesTagSearchElement();

    await webdriver.wait(async () => {
        return await noTagMatchesSearchElement.isDisplayed();
    }, world.defaultWaitTimeout, 'The no tag matches tag search message is not visible');
});

Then('I should see {int} visible tag(s) in the tab tag assignment view', async function(expectedNumberOfTags: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const browserSupport = world.browserSupport;
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    let actualNumberOfTags = 0;
    await webdriverHelper.wait(async () => {
        const tagElementList = await tabTagAssignmentSupport.getAllTagElements();

        if (tagElementList.length < expectedNumberOfTags) {
            return false;
        }

        actualNumberOfTags = await browserSupport.getNumberOfVisibleElements(tagElementList);

        return actualNumberOfTags === expectedNumberOfTags;
    }, world.defaultWaitTimeout, () => `Number of visible tab tags "${actualNumberOfTags}" in the tab tag assignment view is different than expected "${expectedNumberOfTags}"`);
});

Then('I should see the tag {int} with the label {string} in the tab tag assignment view', async function(tagPosition: number, expectedLabel: string) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;
    const tagElement = await tabTagAssignmentSupport.getTagAtPosition(tagPosition, 'visible');

    let actualLabel: string = null;
    await webdriverHelper.wait(async () => {
        actualLabel = await tabTagAssignmentSupport.getTagLabel(tagElement);

        return actualLabel === expectedLabel;
    }, world.defaultWaitTimeout, () => `Tag label "${actualLabel}" in the tab tag assignment view is different than expected "${expectedLabel}"`);
});

Then('I should see the tag {int} with the color {int} in the tab tag assignment view', async function(tagPosition: number, expectedColorId: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;
    const tagElement = await tabTagAssignmentSupport.getTagAtPosition(tagPosition, 'visible');

    let actualColorId = 0;
    await webdriverHelper.wait(async () => {
        actualColorId = +await tagElement.getAttribute('data-color');

        return actualColorId === expectedColorId;
    }, world.defaultWaitTimeout, () => `Tag color id "${actualColorId}" in the tab tag assignment view is different than expected "${expectedColorId}"`);
});

Then('the tag {int} in the tab tag assignment view should be checked', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;
    const tagElement = await tabTagAssignmentSupport.getTagAtPosition(tagPosition, 'visible');

    await webdriverHelper.wait(async () => {
        return await tabTagAssignmentSupport.isTagChecked(tagElement);
    }, world.defaultWaitTimeout, () => `The checkbox of the tag "${tagPosition}" in the tab tag assignment view is not checked`);
});

Then('the tag {int} in the tab tag assignment view should be unchecked', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;
    const tagElement = await tabTagAssignmentSupport.getTagAtPosition(tagPosition, 'visible');

    await webdriverHelper.wait(async () => {
        return await tabTagAssignmentSupport.isTagUnchecked(tagElement);
    }, world.defaultWaitTimeout, () => `The checkbox of the tag "${tagPosition}" in the tab tag assignment view is not checked`);
});

Then('the tag {int} in the tab tag assignment view should be indeterminate', async function(tagPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;
    const tagElement = await tabTagAssignmentSupport.getTagAtPosition(tagPosition, 'visible');

    await webdriverHelper.wait(async () => {
        return await tabTagAssignmentSupport.isTagCheckStateIsIndeterminate(tagElement);
    }, world.defaultWaitTimeout, () => `The checkbox of the tag "${tagPosition}" in the tab tag assignment view is not checked`);
});
