import { Then } from 'cucumber';
import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { World } from '../support/world';

function getCloseTabOnMiddleClickElement(webdriver: WebDriver): WebElement {
    return webdriver.findElement(By.css('#close-tab-on-middle-click'));
}

function getShowTabCloseButtonOnHoverElement(webdriver: WebDriver): WebElement {
    return webdriver.findElement(By.css('#show-tab-close-button-on-hover'));
}

function getShowTabTitleOnSeveralLinesElement(webdriver: WebDriver): WebElement {
    return webdriver.findElement(By.css('#show-tab-title-on-several-lines'));
}

function getShowTabUrlOnSeveralLinesElement(webdriver: WebDriver): WebElement {
    return webdriver.findElement(By.css('#show-tab-url-on-several-lines'));
}

function getShowTabUrlElement(webdriver: WebDriver): WebElement {
    return webdriver.findElement(By.css('#show-url'));
}

Then('the tab middle click close setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getCloseTabOnMiddleClickElement(webdriver);

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, 10000, 'The tab middle click close setting is not checked');
});

Then('the tab middle click close setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getCloseTabOnMiddleClickElement(webdriver);

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, 10000, 'The tab middle click close setting is checked');
});

Then('the tab close button on hover setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getShowTabCloseButtonOnHoverElement(webdriver);

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, 10000, 'The tab close button on hover setting is not checked');
});

Then('the tab close button on hover setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getShowTabCloseButtonOnHoverElement(webdriver);

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, 10000, 'The tab close button on hover setting is not checked');
});

Then('the show tab title on several lines setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getShowTabTitleOnSeveralLinesElement(webdriver);

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, 10000, 'The show tab title on several lines setting is not checked');
});

Then('the show tab title on several lines setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getShowTabTitleOnSeveralLinesElement(webdriver);

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, 10000, 'The show tab title on several lines setting is not checked');
});

Then('the show tab url on several lines setting should be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getShowTabUrlOnSeveralLinesElement(webdriver);

    await webdriver.wait(async () => {
        return await checkboxElement.isSelected();
    }, 10000, 'The show tab url on several lines setting is not checked');
});

Then('the show tab url on several lines setting should not be checked', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const checkboxElement = getShowTabUrlOnSeveralLinesElement(webdriver);

    await webdriver.wait(async () => {
        return !await checkboxElement.isSelected();
    }, 10000, 'The show tab url on several lines setting is not checked');
});

Then('the show tab url setting should be set to "domain only"', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const selectElement = getShowTabUrlElement(webdriver);
    let selectValue: string;

    await webdriverHelper.wait(async () => {
        selectValue = await webdriverHelper.getSelectedValue(selectElement);

        return 'domain' === selectValue;
    }, 10000, () => `The tab show url setting is not set to "domain only" but to ${selectValue}`);
});

Then('the show tab url setting should be set to "yes"', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const selectElement = getShowTabUrlElement(webdriver);
    let selectValue: string;

    await webdriverHelper.wait(async () => {
        selectValue = await webdriverHelper.getSelectedValue(selectElement);

        return 'url' === selectValue;
    }, 10000, () => `The tab show url setting is not set to "yes" but to ${selectValue}`);
});

Then('the show tab url setting should be set to "no"', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const selectElement = getShowTabUrlElement(webdriver);
    let selectValue: string;

    await webdriverHelper.wait(async () => {
        selectValue = await webdriverHelper.getSelectedValue(selectElement);

        return 'none' === selectValue;
    }, 10000, () => `The tab show url setting is not set to "no" but to ${selectValue}`);
});
