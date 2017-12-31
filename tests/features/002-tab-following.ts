import { assert } from 'chai';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { WebDriverRetriever } from '../webdriver/webdriver-retriever';

let webdriverRetriever: WebDriverRetriever;
let driver: WebDriver;
const browserInstructionSender: BrowserInstructionSender = BrowserInstructionSender.getInstance();

async function showOpenedTabsList() {
    const openedTabListElement = driver.findElement(By.css('#openedTabList'));
    await driver.findElement(By.css('#header .openedTabs')).click();
    await driver.wait(until.elementIsVisible(openedTabListElement), 3000);
}

async function showFollowedTabsList() {
    const followedTabListElement = driver.findElement(By.css('#followedTabList'));
    await driver.findElement(By.css('#header .followedTabs')).click();
    await driver.wait(until.elementIsVisible(followedTabListElement), 3000);
}

describe('Tab following', () => {
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

    it('The no tab row should appear when there is no followed tab', async () => {
        await showFollowedTabsList();

        const isNoTabRowVisible = await driver.findElement(By.css('#followedTabList tbody .noTabRow')).isDisplayed();
        const numberOfRows = (await driver.findElements(By.css('#followedTabList tbody tr'))).length;

        assert.isTrue(isNoTabRowVisible);
        assert.strictEqual(numberOfRows, 1);
    });

    it('Opened tabs should be followable', async () => {
        await showOpenedTabsList();
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.openTab(newTabUrl);
        await driver.wait(until.elementLocated(By.css('#openedTabList tbody tr[data-tab-id]')), 3000);

        const followButton = driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .followButton'));
        const followButtonClasses = '' + await followButton.getAttribute('class');

        assert.isTrue(await followButton.isDisplayed());
        assert.notMatch(followButtonClasses, /disabled/);
    });

    it('Followed tabs should be shown in the followed tabs list', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .followButton')).click();
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody tr[data-follow-id]')), 3000);
        await showFollowedTabsList();

        const isNoTabRowVisible = await driver.findElement(By.css('#followedTabList tbody .noTabRow')).isDisplayed();
        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
        const tabShownUrl = await followedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await followedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await followedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');
        const isOpenIndicatorOnVisible = await followedTabRowList[0].findElement(By.css('.openIndicator .on')).isDisplayed();
        const isOpenIndicatorOffVisible = await followedTabRowList[0].findElement(By.css('.openIndicator .off')).isDisplayed();

        const expectedUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        assert.equal(followedTabRowList.length, 1);
        assert.equal(tabShownUrl, expectedUrl);
        assert.equal(tabShownTitle, 'Test page 1');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
        assert.isTrue(isOpenIndicatorOnVisible);
        assert.isFalse(isOpenIndicatorOffVisible);
        assert.isFalse(isNoTabRowVisible);
    });

    xit('Opened tabs with a privileged url should not be followable', async () => {
        // TODO
    });

    xit("Title, url and favicon should be updated when associated opened tab's url change", async () => {
        // TODO
    });

    xit('A tab should be unfollowable in the opened tabs list', async () => {
        // TODO
    });

    xit('A tab should be unfollowable in the followed tabs list', async () => {
        // TODO
    });

    xit('Open status of a followed tab should be updated when closing its associated opened tab', async () => {
        // TODO
    });

    xit('Reader mode status of a followed tab should be updated when enabling reader mode on its associated opened tab', async () => {
        // TODO
    });

    xit('Reader mode status of a followed tab should be updated when disabling reader mode on its associated opened tab', async () => {
        // TODO
    });

    xit('Associated opened tab should be closed when clicking on a close button in the followed tab list', async () => {
        // TODO
    });

    xit('A click on a followed tab that is closed should open it', async () => {
        // TODO
    });

    xit('The no tab row should appear when there is no followed tab anymore', async () => {
        // TODO
    });

    xit('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed', async () => {
        // TODO
    });
});
