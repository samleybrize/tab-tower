import { When } from 'cucumber';
import { By, WebDriver } from 'selenium-webdriver';

import { World } from '../support/world';

function selectUrlSetting(webdriver: WebDriver, value: string) {
    return webdriver.findElement(By.css(`#show-url option[value="${value}"]`)).click();
}

When('I click on the checkbox of the tab middle click close setting', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await webdriver.findElement(By.css('#close-tab-on-middle-click')).click();
});

When('I click on the checkbox of the tab close button on hover setting', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await webdriver.findElement(By.css('#show-tab-close-button-on-hover')).click();
});

When('I click on the checkbox of the show tab title on several lines setting', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await webdriver.findElement(By.css('#show-tab-title-on-several-lines')).click();
});

When('I click on the checkbox of the show tab url on several lines setting', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await webdriver.findElement(By.css('#show-tab-url-on-several-lines')).click();
});

When('I set the show tab url setting to "domain only"', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await selectUrlSetting(webdriver, 'domain');
});

When('I set the show tab url setting to "yes"', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await selectUrlSetting(webdriver, 'url');
});

When('I set the show tab url setting to "no"', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    await selectUrlSetting(webdriver, 'none');
});
