import { Then } from 'cucumber';
import { World } from '../support/world';

Then('the tab middle click close setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getCloseTabOnMiddleClickElement();

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The tab middle click close setting is not checked');
});

Then('the tab middle click close setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getCloseTabOnMiddleClickElement();

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The tab middle click close setting is checked');
});

Then('the tab close button on hover setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabCloseButtonOnHoverElement();

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The tab close button on hover setting is not checked');
});

Then('the tab close button on hover setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabCloseButtonOnHoverElement();

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The tab close button on hover setting is checked');
});

Then('the show tab title on several lines setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabTitleOnSeveralLinesElement();

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The show tab title on several lines setting is not checked');
});

Then('the show tab title on several lines setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabTitleOnSeveralLinesElement();

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The show tab title on several lines setting is checked');
});

Then('the show tab url on several lines setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabUrlOnSeveralLinesElement();

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The show tab url on several lines setting is not checked');
});

Then('the show tab url on several lines setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabUrlOnSeveralLinesElement();

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, world.defaultWaitTimeout, 'The show tab url on several lines setting is not checked');
});

Then('the show tab url setting should be set to "domain only"', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const browserSupport = world.browserSupport;
    const settingsSupport = world.settingsSupport;

    const selectElement = settingsSupport.getShowTabUrlElement();

    let selectValue: string;
    await webdriverHelper.wait(async () => {
        selectValue = await browserSupport.getSelectedValue(selectElement);

        return 'domain' === selectValue;
    }, world.defaultWaitTimeout, () => `The tab show url setting is not set to "domain only" but to ${selectValue}`);
});

Then('the show tab url setting should be set to "yes"', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const browserSupport = world.browserSupport;
    const settingsSupport = world.settingsSupport;

    const selectElement = settingsSupport.getShowTabUrlElement();

    let selectValue: string;
    await webdriverHelper.wait(async () => {
        selectValue = await browserSupport.getSelectedValue(selectElement);

        return 'url' === selectValue;
    }, world.defaultWaitTimeout, () => `The tab show url setting is not set to "yes" but to ${selectValue}`);
});

Then('the show tab url setting should be set to "no"', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const browserSupport = world.browserSupport;
    const settingsSupport = world.settingsSupport;

    const selectElement = settingsSupport.getShowTabUrlElement();

    let selectValue: string;
    await webdriverHelper.wait(async () => {
        selectValue = await browserSupport.getSelectedValue(selectElement);

        return 'none' === selectValue;
    }, world.defaultWaitTimeout, () => `The tab show url setting is not set to "no" but to ${selectValue}`);
});
