import { assert } from 'chai';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
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

    it('Opened tab should appear in the opened tabs list', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        browserInstructionSender.send({action: 'open-tab', data: {url: newTabUrl}});
        await sleep(1000);

        const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tabShownUrl = await openedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await openedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await openedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');

        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        assert.equal(openedTabRowList.length, 1);
        assert.equal(tabShownUrl, newTabUrl);
        assert.equal(tabShownTitle, 'Test page 1');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
        assert.isFalse(isNoTabRowVisible);
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
