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
        const followButtonClasses = ('' + await followButton.getAttribute('class')).split(' ');

        assert.isTrue(await followButton.isDisplayed());
        assert.notInclude(followButtonClasses, 'disabled');
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

    it('Opened tabs with a privileged url should not be followable', async () => {
        await showOpenedTabsList();

        await browserInstructionSender.openTab();
        await driver.wait(until.elementLocated(By.css('#openedTabList tbody tr[data-index="2"]')), 3000);

        const followButton = driver.findElement(By.css('#openedTabList tbody tr[data-index="2"] .followButton'));
        const followButtonClasses = ('' + await followButton.getAttribute('class')).split(' ');

        assert.isTrue(await followButton.isDisplayed());
        assert.include(followButtonClasses, 'disabled');
    });

    it("Title, url and favicon should be updated when associated opened tab's url change", async () => {
        await showFollowedTabsList();
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html');
        await browserInstructionSender.changeTabUrl(1, newTabUrl);
        await sleep(1000);

        const isNoTabRowVisible = await driver.findElement(By.css('#followedTabList tbody .noTabRow')).isDisplayed();
        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
        const tabShownUrl = await followedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await followedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await followedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');
        const isOpenIndicatorOnVisible = await followedTabRowList[0].findElement(By.css('.openIndicator .on')).isDisplayed();
        const isOpenIndicatorOffVisible = await followedTabRowList[0].findElement(By.css('.openIndicator .off')).isDisplayed();

        const expectedUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html');
        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png');
        assert.equal(followedTabRowList.length, 1);
        assert.equal(tabShownUrl, expectedUrl);
        assert.equal(tabShownTitle, 'Test page 2');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
        assert.isTrue(isOpenIndicatorOnVisible);
        assert.isFalse(isOpenIndicatorOffVisible);
        assert.isFalse(isNoTabRowVisible);
    });

    it('A tab should be unfollowable in the opened tabs list', async () => {
        await showOpenedTabsList();

        const followButton = driver.findElement(By.css('#openedTabList tbody tr[data-index="1"] .followButton'));
        const unfollowButton = driver.findElement(By.css('#openedTabList tbody tr[data-index="1"] .unfollowButton'));

        assert.isFalse(await followButton.isDisplayed());
        assert.isTrue(await unfollowButton.isDisplayed());
    });

    it('A tab should be unfollowable in the followed tabs list', async () => {
        await showFollowedTabsList();

        const unfollowButton = driver.findElement(By.css('#followedTabList tbody tr[data-opened-tab-id="2"] .unfollowButton'));

        assert.isTrue(await unfollowButton.isDisplayed());
    });

    it('Reader mode status of a followed tab should be updated when enabling reader mode on its associated opened tab', async () => {
        const cell = await driver.findElement(By.css('#followedTabList tbody tr[data-opened-tab-id="2"] .readerModeIndicator'));
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

    it('Reader mode status of a followed tab should be updated when disabling reader mode on its associated opened tab', async () => {
        const cell = await driver.findElement(By.css('#followedTabList tbody tr[data-opened-tab-id="2"] .readerModeIndicator'));
        const onIndicator = cell.findElement(By.css('.on'));
        const offIndicator = cell.findElement(By.css('.off'));

        await browserInstructionSender.toggleReaderMode(1);
        await driver.wait(until.elementIsNotVisible(onIndicator), 3000);

        assert.isFalse(await onIndicator.isDisplayed());
        assert.isTrue(await offIndicator.isDisplayed());
    });

    it('Tab unfollowed from the opened tabs list should be removed from the followed tabs list', async () => {
        await showOpenedTabsList();

        const followButton = await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id="2"] .followButton'));
        await browserInstructionSender.triggerDoubleClick(driver, '#openedTabList tbody tr[data-tab-id="2"] .unfollowButton');
        await driver.wait(until.elementIsVisible(followButton), 3000);
        await showFollowedTabsList();

        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));

        assert.equal(followedTabRowList.length, 0);
    });

    it('Tab unfollowed from the followed tabs list should be removed from the followed tabs list', async () => {
        await showOpenedTabsList();

        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id="2"] .followButton')).click();
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody tr[data-follow-id]')), 3000);
        await showFollowedTabsList();

        await browserInstructionSender.triggerDoubleClick(driver, '#followedTabList tbody tr[data-opened-tab-id="2"] .unfollowButton');
        await sleep(1000);

        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));

        assert.equal(followedTabRowList.length, 0);
    });

    it('Open status of a followed tab should be updated when closing its associated opened tab', async () => {
        await showOpenedTabsList();

        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id="2"] .followButton')).click();
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody tr[data-follow-id]')), 3000);
        await showFollowedTabsList();

        const cell = await driver.findElement(By.css('#followedTabList tbody tr[data-opened-tab-id="2"] .openIndicator'));
        const onIndicator = cell.findElement(By.css('.on'));
        const offIndicator = cell.findElement(By.css('.off'));

        await browserInstructionSender.closeTab(1);
        await driver.wait(until.elementIsNotVisible(onIndicator), 3000);

        assert.isFalse(await onIndicator.isDisplayed());
        assert.isTrue(await offIndicator.isDisplayed());
    });

    it('Close button should not be shown when there is no associated opened tab', async () => {
        const isCloseButtonVisible = await driver.findElement(By.css('#followedTabList tbody tr[data-follow-id] .closeButton')).isDisplayed();

        assert.isFalse(isCloseButtonVisible);
    });

    it('Associated opened tab should be closed when clicking on a close button in the followed tab list', async () => {
        await showOpenedTabsList();
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.openTab(newTabUrl);
        await driver.wait(until.elementLocated(By.css('#openedTabList tbody tr[data-tab-id="4"]')), 3000);

        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id="4"] .followButton')).click();
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody tr[data-opened-tab-id="4"]')), 3000);
        await showFollowedTabsList();

        await driver.findElement(By.css('#followedTabList tbody tr[data-opened-tab-id="4"] .closeButton')).click();
        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
        const openIndicatorOn = followedTabRowList[1].findElement(By.css('.openIndicator .on'));
        const openIndicatorOff = followedTabRowList[1].findElement(By.css('.openIndicator .off'));
        await driver.wait(until.elementIsNotVisible(openIndicatorOn), 3000);

        assert.isFalse(await openIndicatorOn.isDisplayed());
        assert.isTrue(await openIndicatorOff.isDisplayed());
    });

    it('The no tab row should appear when there is no followed tab anymore', async () => {
        await browserInstructionSender.triggerDoubleClick(driver, '#followedTabList tbody tr[data-follow-id] .unfollowButton');
        await sleep(500);
        await browserInstructionSender.triggerDoubleClick(driver, '#followedTabList tbody tr[data-follow-id] .unfollowButton');
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody .noTabRow')), 3000);

        const isNoTabRowVisible = await driver.findElement(By.css('#followedTabList tbody .noTabRow')).isDisplayed();
        const numberOfRows = (await driver.findElements(By.css('#followedTabList tbody tr'))).length;

        assert.isTrue(isNoTabRowVisible);
        assert.strictEqual(numberOfRows, 1);
    });

    it('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        const newTabUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.closeTab(1);
        await browserInstructionSender.openTab(newTabUrl);
        await sleep(1000);

        await showOpenedTabsList();
        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .followButton')).click();
        await showFollowedTabsList();
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody tr[data-follow-id]')), 3000);

        const windows = await driver.getAllWindowHandles();
        await driver.switchTo().window(windows[1]);
        await driver.get('about:config');
        await sleep(1000);

        await driver.switchTo().window(windows[0]);
        await sleep(1000);

        await browserInstructionSender.closeTab(1);
        await sleep(500);

        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
        const tabShownUrl = await followedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await followedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await followedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');

        const expectedUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        assert.equal(tabShownUrl, expectedUrl);
        assert.equal(tabShownTitle, 'Test page 1');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
    });

    it('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed (with click on previous button)', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();

        await browserInstructionSender.triggerDoubleClick(driver, '#followedTabList tbody tr[data-follow-id] .unfollowButton');
        await browserInstructionSender.closeTab(1);
        await browserInstructionSender.openTab();
        await sleep(1000);

        const url = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        await browserInstructionSender.changeTabUrl(1, url);
        await sleep(1000);

        await showOpenedTabsList();
        await driver.findElement(By.css('#openedTabList tbody tr[data-tab-id] .followButton')).click();
        await showFollowedTabsList();
        await driver.wait(until.elementLocated(By.css('#followedTabList tbody tr[data-follow-id]')), 3000);

        await browserInstructionSender.makeTabGoToPreviousPage(1);
        await sleep(500);

        await browserInstructionSender.closeTab(1);
        await sleep(500);

        const followedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
        const tabShownUrl = await followedTabRowList[0].findElement(By.css('.title a')).getAttribute('data-url');
        const tabShownTitle = await followedTabRowList[0].findElement(By.css('.title a span')).getText();
        const tabShownFaviconUrl = await followedTabRowList[0].findElement(By.css('.title a img')).getAttribute('src');

        const expectedUrl = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png');
        assert.equal(tabShownUrl, expectedUrl);
        assert.equal(tabShownTitle, 'Test page 1');
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
    });
});