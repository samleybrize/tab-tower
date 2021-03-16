import { Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { World } from '../support/world';

Then("I should see the browser's tab {int} as focused", async function(expectedFocusedTabPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    let actualFocusedTabPosition: number;
    await webdriverHelper.wait(async () => {
        actualFocusedTabPosition = await webdriverHelper.executeScript(async () => {
            const activeTabList = await browser.tabs.query({active: true});

            return activeTabList ? activeTabList[0].index : null;
        });

        return actualFocusedTabPosition === expectedFocusedTabPosition;
    }, 10000, () => `Actual focused tab position "${actualFocusedTabPosition}" is different than expected "${expectedFocusedTabPosition}"`);
});

Then('I should see {int} browser tabs', async function(expectedNumberOfTabs: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    let actualNumberOfTabs: number;
    await webdriverHelper.wait(async () => {
        const nativeTabList = await webdriverHelper.executeScript(async () => {
            return browser.tabs.query({});
        });
        actualNumberOfTabs = nativeTabList.length;

        return actualNumberOfTabs === expectedNumberOfTabs;
    }, 10000, () => `Actual number of browser tabs "${actualNumberOfTabs}" is different than expected "${expectedNumberOfTabs}"`);
});

Then('I should see the settings page on the tab {int}', async function(tabIndex: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.wait(async () => {
        await webdriverHelper.switchToWindowHandle(tabIndex);
        const tabUrl = await webdriver.getCurrentUrl();
        const expectedUrl = `about:addons`;

        return expectedUrl === tabUrl;
    }, 10000, `The tab "${tabIndex}" is not the settings page`);
});
