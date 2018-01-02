import { assert } from 'chai';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { WebDriverRetriever } from '../webdriver/webdriver-retriever';

let webdriverRetriever: WebDriverRetriever;
let driver: WebDriver;
const browserInstructionSender: BrowserInstructionSender = BrowserInstructionSender.getInstance();

describe('Navigation', () => {
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

    it('Followed tabs list should be shown when clicking on the followed tabs button', async () => {
        const breadcrumbElement = driver.findElement(By.css('#header .title span'));
        const openedTabListElement = driver.findElement(By.css('#openedTabList'));
        const followedTabListElement = driver.findElement(By.css('#followedTabList'));

        await driver.findElement(By.css('#header .followedTabs')).click();
        await driver.wait(until.elementIsNotVisible(openedTabListElement), 3000);

        assert.isFalse(await openedTabListElement.isDisplayed());
        assert.isTrue(await followedTabListElement.isDisplayed());
        assert.equal(await breadcrumbElement.getText(), 'Followed tabs');
    });

    it('Opened tabs list should be shown when clicking on the opened tabs button', async () => {
        const breadcrumbElement = driver.findElement(By.css('#header .title span'));
        const openedTabListElement = driver.findElement(By.css('#openedTabList'));
        const followedTabListElement = driver.findElement(By.css('#followedTabList'));

        await driver.findElement(By.css('#header .openedTabs')).click();
        await driver.wait(until.elementIsNotVisible(followedTabListElement), 3000);

        assert.isTrue(await openedTabListElement.isDisplayed());
        assert.isFalse(await followedTabListElement.isDisplayed());
        assert.equal(await breadcrumbElement.getText(), 'Opened tabs');
    });

    it('Opened tabs counter should indicate 0 when there is no opened tab', async () => {
        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));

        assert.equal(await openedTabsCounter.getText(), '0');
    });

    it('Opened tabs counter should be updated when opening a new tab', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.openTab(newTabUrl);
        await browserInstructionSender.openTab(newTabUrl);
        await driver.wait(until.elementTextIs(openedTabsCounter, '2'), 2000);

        assert.equal(await openedTabsCounter.getText(), '2');
    });

    it('Opened tabs counter should be updated when closing a tab', async () => {
        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));

        await browserInstructionSender.closeTab(1);
        await driver.wait(until.elementTextIs(openedTabsCounter, '1'), 2000);

        assert.equal(await openedTabsCounter.getText(), '1');
    });

    it('Followed tabs counter should indicate 0 when there is no followed tab', async () => {
        const followedTabsCounter = driver.findElement(By.css('#header .followedTabs .counter'));

        assert.equal(await followedTabsCounter.getText(), '0');
    });

    it('Followed tabs counter should be updated when following a tab', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));
        const followedTabsCounter = driver.findElement(By.css('#header .followedTabs .counter'));

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.openTab(newTabUrl);
        await browserInstructionSender.openTab(newTabUrl);
        await driver.wait(until.elementTextIs(openedTabsCounter, '3'), 2000);

        await driver.findElement(By.css('#openedTabList tbody tr[data-index="1"] .followButton')).click();
        await driver.findElement(By.css('#openedTabList tbody tr[data-index="2"] .followButton')).click();
        await driver.wait(until.elementTextIs(followedTabsCounter, '2'), 2000);

        assert.equal(await followedTabsCounter.getText(), '2');
    });

    it('Followed tabs counter should be updated when unfollowing a tab', async () => {
        const followedTabsCounter = driver.findElement(By.css('#header .followedTabs .counter'));
        const unfollowButton = driver.findElement(By.css('#openedTabList tbody tr[data-index="1"] .unfollowButton'));

        await browserInstructionSender.triggerDoubleClick(driver, '#openedTabList tbody tr[data-index="1"] .unfollowButton');
        await driver.wait(until.elementTextIs(followedTabsCounter, '1'), 2000);

        assert.equal(await followedTabsCounter.getText(), '1');
    });

    it('New tab should be opened when clicking on the new tab button', async () => {
        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));

        await driver.findElement(By.css('#header .newTab')).click();
        await driver.wait(until.elementTextIs(openedTabsCounter, '4'), 2000);

        assert.equal(await openedTabsCounter.getText(), '4');
    });

    it('Opened tabs counter should indicate the number of opened tab at startup', async () => {
        await browserInstructionSender.reloadExtension();
        await sleep(1000);

        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        const windowHandleList = await driver.getAllWindowHandles();
        await driver.switchTo().window(windowHandleList[0]);
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));

        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));
        assert.equal(await openedTabsCounter.getText(), '3');
    });

    it('Followed tabs counter should indicate the number of followed tab at startup', async () => {
        await browserInstructionSender.reloadExtension();
        await sleep(1000);

        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        const windowHandleList = await driver.getAllWindowHandles();
        await driver.switchTo().window(windowHandleList[0]);
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));

        const followedTabsCounter = driver.findElement(By.css('#header .followedTabs .counter'));
        assert.equal(await followedTabsCounter.getText(), '1');
    });
});
