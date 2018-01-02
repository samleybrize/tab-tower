import { assert } from 'chai';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { WebDriverRetriever } from '../webdriver/webdriver-retriever';

let webdriverRetriever: WebDriverRetriever;
let driver: WebDriver;
const browserInstructionSender: BrowserInstructionSender = BrowserInstructionSender.getInstance();

describe('Opened tabs tracking', () => {
    before(async () => {
        webdriverRetriever = WebDriverRetriever.getInstance();
        driver = webdriverRetriever.getDriver();
        browserInstructionSender.init();

        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));
    });
    after(async () => {
        await driver.quit();
        browserInstructionSender.shutdown();
    });

    it('The no tab row should appear when there is no opened tab', async () => {
        const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
        const numberOfRows = (await driver.findElements(By.css('#openedTabList tbody tr'))).length;

        assert.isTrue(isNoTabRowVisible);
        assert.strictEqual(numberOfRows, 1);
    });

    it('Opened tab should appear in the opened tabs list', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.openTab(newTabUrl);
        await driver.wait(until.elementLocated(By.css('#openedTabList tbody tr[data-tab-id]')), 3000);

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

    it("Title, url and favicon should be updated when an opened tab's url change", async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html');
        await browserInstructionSender.changeTabUrl(1, newTabUrl);
        await sleep(1000);

        const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tabShownUrl = await openedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await openedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await openedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');

        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png');
        assert.equal(openedTabRowList.length, 1);
        assert.equal(tabShownUrl, newTabUrl);
        assert.equal(tabShownTitle, 'Test page 2');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
        assert.isFalse(isNoTabRowVisible);
    });

    it('Default favicon should be shown when an opened tab have not', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page-without-favicon.html');
        await browserInstructionSender.changeTabUrl(1, newTabUrl);
        await sleep(1000);

        const openedTabRow = await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tabShownFaviconUrl = await openedTabRow.findElement(By.css('.title a img')).getAttribute('src');

        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/ui/images/default-favicon.svg');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
    });

    it("Default favicon should be shown when an opened tab's favicon can't be downloaded", async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-not-found-favicon.html');
        await browserInstructionSender.changeTabUrl(1, newTabUrl);
        await sleep(1000);

        const openedTabRow = await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tabShownFaviconUrl = await openedTabRow.findElement(By.css('.title a img')).getAttribute('src');

        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/ui/images/default-favicon.svg');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
    });

    it('Reader mode should be shown in the opened tabs list when enabled', async () => {
        const cell = await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .readerModeIndicator'));
        const onIndicator = cell.findElement(By.css('.on'));
        const offIndicator = cell.findElement(By.css('.off'));

        const newTabUrl = 'http://www.wikipedia.fr'; // TODO
        await browserInstructionSender.changeTabUrl(1, newTabUrl);
        await sleep(1000);
        await browserInstructionSender.toggleReaderMode(1);
        await driver.wait(until.elementIsNotVisible(offIndicator), 3000);

        assert.isTrue(await onIndicator.isDisplayed());
        assert.isFalse(await offIndicator.isDisplayed());
    });

    it('Reader mode should not be shown in the opened tabs list when disabled', async () => {
        const cell = await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .readerModeIndicator'));
        const onIndicator = cell.findElement(By.css('.on'));
        const offIndicator = cell.findElement(By.css('.off'));

        await browserInstructionSender.toggleReaderMode(1);
        await driver.wait(until.elementIsNotVisible(onIndicator), 3000);

        assert.isFalse(await onIndicator.isDisplayed());
        assert.isTrue(await offIndicator.isDisplayed());
    });

    it('Opened tab should be removed from opened tabs list when closed', async () => {
        await browserInstructionSender.closeTab(1);
        await sleep(1000);

        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));

        assert.strictEqual(openedTabRowList.length, 0);
    });

    it('The no tab row should appear when there is no opened tab anymore', async () => {
        const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();

        assert.isTrue(isNoTabRowVisible);
    });

    it('Rows in the opened tab list should be moved when an opened tab is moved', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl1 = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const newTabUrl2 = firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html');
        await browserInstructionSender.openTab(newTabUrl1);
        await browserInstructionSender.openTab(newTabUrl2);
        await driver.wait(until.elementsLocated(By.css('#openedTabList tbody tr[data-index="1"]')), 3000);
        await driver.wait(until.elementsLocated(By.css('#openedTabList tbody tr[data-index="2"]')), 3000);
        await browserInstructionSender.moveTab(1, 2);
        await sleep(1000);

        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tab1ShownUrl = await openedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tab1ShownTitle = await openedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tab1ShownFaviconUrl = await openedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');
        const tab2ShownUrl = await openedTabRowList[1].findElement(By.css('.title a')).getAttribute('data-url');
        const tab2ShownTitle = await openedTabRowList[1].findElement(By.css('.title a span')).getText();
        const tab2ShownFaviconUrl = await openedTabRowList[1].findElement(By.css('.title a img')).getAttribute('src');

        const expectedFaviconUrl1 = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        const expectedFaviconUrl2 = firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png');
        assert.equal(openedTabRowList.length, 2);
        assert.equal(tab1ShownUrl, newTabUrl2);
        assert.equal(tab1ShownTitle, 'Test page 2');
        assert.equal(tab1ShownFaviconUrl, expectedFaviconUrl2);
        assert.equal(tab2ShownUrl, newTabUrl1);
        assert.equal(tab2ShownTitle, 'Test page 1');
        assert.equal(tab2ShownFaviconUrl, expectedFaviconUrl1);
    });

    it('Associated tab should be closed when clicking on a close button in the opened tab list', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .closeButton')).click();
        await sleep(1000);

        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tabShownUrl = await openedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await openedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await openedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');

        const expectedUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        assert.equal(openedTabRowList.length, 1);
        assert.equal(tabShownUrl, expectedUrl);
        assert.equal(tabShownTitle, 'Test page 1');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
    });

    it('Should show opened tabs at startup', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        const tab1Url = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const tab2Url = firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html');

        await browserInstructionSender.openTab(tab2Url);
        await browserInstructionSender.openTab();
        await browserInstructionSender.reloadExtension();
        await sleep(1000);

        const windowHandles = await driver.getAllWindowHandles();
        driver.switchTo().window(windowHandles[2]);
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));

        const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));
        const tab1ShownUrl = await openedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tab1ShownTitle = await openedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tab1ShownFaviconUrl = await openedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');
        const tab2ShownUrl = await openedTabRowList[1].findElement(By.css('.title a')).getAttribute('data-url');
        const tab2ShownTitle = await openedTabRowList[1].findElement(By.css('.title a span')).getText();
        const tab2ShownFaviconUrl = await openedTabRowList[1].findElement(By.css('.title a img')).getAttribute('src');

        const expectedFaviconUrl1 = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        const expectedFaviconUrl2 = firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png');
        assert.equal(openedTabRowList.length, 2);
        assert.equal(tab1ShownUrl, tab1Url);
        assert.equal(tab1ShownTitle, 'Test page 1');
        assert.equal(tab1ShownFaviconUrl, expectedFaviconUrl1);
        assert.equal(tab2ShownUrl, tab2Url);
        assert.equal(tab2ShownTitle, 'Test page 2');
        assert.equal(tab2ShownFaviconUrl, expectedFaviconUrl2);
        assert.isFalse(isNoTabRowVisible);
    });

    it('Incognito tabs should not be shown in the opened tabs list', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const url = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.closeTab(0);
        await browserInstructionSender.closeTab(1);
        await browserInstructionSender.createWindow(true, url);
        await sleep(1000);

        const openedTabRowList = await driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));

        assert.strictEqual(openedTabRowList.length, 0);
    });
});
