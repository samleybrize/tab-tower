import { Then } from 'cucumber';
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
