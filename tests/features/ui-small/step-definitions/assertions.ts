import { Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { World } from '../support/world';

// TODO rename file

Then('I should see the current workspace with label {string} and {int} tab(s) indicated', async function(expectedLabel: string, expectedNumberOfTabs: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const labelElement = webdriver.findElement(By.css('.current-workspace .name'));
    const numberOfTabsElement = webdriver.findElement(By.css('.current-workspace .number-of-tabs'));

    let actualLabel: string;
    await webdriverHelper.wait(async () => {
        actualLabel = await labelElement.getText();

        return actualLabel === expectedLabel;
    }, 10000, () => `Current workspace label "${actualLabel}" is different than expected "${expectedLabel}"`);

    let actualNumberOfTabs: string;
    await webdriverHelper.wait(async () => {
        actualNumberOfTabs = await numberOfTabsElement.getText();

        return actualNumberOfTabs === '' + expectedNumberOfTabs;
    }, 10000, () => `Current workspace number of tabs "${actualNumberOfTabs}" is different than expected "${expectedNumberOfTabs}"`);
});
