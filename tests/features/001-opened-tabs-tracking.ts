import { assert } from 'chai';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { WebDriverRetriever } from '../webdriver/webdriver-retriever';

let webdriverRetriever: WebDriverRetriever;
let driver: WebDriver;
const browserInstructionSender: BrowserInstructionSender = BrowserInstructionSender.getInstance();

describe('Opened tabs tracking', () => {
    before(() => {
        webdriverRetriever = WebDriverRetriever.getInstance();
        driver = webdriverRetriever.getDriver();
        browserInstructionSender.init();
    });
    after(() => {
        driver.quit();
        browserInstructionSender.shutdown();
    });

    it('The no tab row should appear when there is no opened tab', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));
        const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
        const numberOfRows = (await driver.findElements(By.css('#openedTabList tbody tr'))).length;

        assert.isTrue(isNoTabRowVisible);
        assert.strictEqual(numberOfRows, 1);
    });

    xit('Opened tab should appear in the opened tabs list', async () => {
        // TODO
        browserInstructionSender.send({action: 'open-tab', data: {url: 'http://google.fr'}}); // TODO
    });

    xit("Title, url and favicon should be updated when an opened tab's url change", async () => {
        // TODO
    });

    xit('Default favicon should be shown when an opened tab have not', async () => {
        // TODO
    });

    xit("Default favicon should be shown when an opened tab's favicon can't be downloaded", async () => {
        // TODO
    });

    xit('Reader mode should be shown in the opened tabs list when enabled', async () => {
        // TODO
    });

    xit('Reader mode should not be shown in the opened tabs list when disabled', async () => {
        // TODO
    });

    xit('Opened tab should be removed from opened tabs list when closed', async () => {
        // TODO
    });

    xit('The no tab row should appear when there is no opened tab anymore', async () => {
        // TODO
    });

    xit('Incognito tabs should not be shown in the opened tabs list', async () => {
        // TODO
    });
});
