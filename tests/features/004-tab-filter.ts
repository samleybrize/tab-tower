import { assert } from 'chai';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { ScreenshotTaker } from '../webdriver/screenshot-taker';
import { WebDriverRetriever } from '../webdriver/webdriver-retriever';

let webdriverRetriever: WebDriverRetriever;
let driver: WebDriver;
const browserInstructionSender = BrowserInstructionSender.getInstance();
const screenshotTaker = ScreenshotTaker.getInstance();

describe('Tab filter', () => {
    before(async () => {
        webdriverRetriever = WebDriverRetriever.getInstance();
        driver = webdriverRetriever.getDriver();
        browserInstructionSender.init();

        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));

        const openedTabsCounter = driver.findElement(By.css('#header .openedTabs .counter'));
        const followedTabsCounter = driver.findElement(By.css('#header .followedTabs .counter'));

        const newTabUrl1 = firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html');
        const newTabUrl2 = firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-not-found-favicon.html');
        const newTabUrl3 = firefoxConfig.getExtensionUrl('/tests/resources/test-page-without-favicon.html');
        await browserInstructionSender.openTab(newTabUrl1);
        await browserInstructionSender.openTab(newTabUrl2);
        await browserInstructionSender.openTab(newTabUrl3);
        await driver.wait(until.elementTextIs(openedTabsCounter, '3'), 2000);

        await driver.findElement(By.css('#openedTabList tbody tr[data-index="1"] .followButton')).click();
        await driver.findElement(By.css('#openedTabList tbody tr[data-index="2"] .followButton')).click();
        await driver.wait(until.elementTextIs(followedTabsCounter, '2'), 2000);
    });
    after(async () => {
        await driver.quit();
        browserInstructionSender.shutdown();
    });
    afterEach(async () => {
        const inputElement = driver.findElement(By.css('#headerTabFilter input'));
        await inputElement.clear();
        await browserInstructionSender.focusElement(driver, '#headerTabFilter input');
        await sleep(500);
    });

    describe('Opened tabs', () => {
        it('Should filter opened tabs by title on input with one word', async () => {
            const firefoxConfig = webdriverRetriever.getFirefoxConfig();

            await driver.findElement(By.css('#headerTabFilter input')).sendKeys('not');
            await sleep(500);

            const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
            const isTabRow1Visible = await driver.findElement(By.css('#openedTabList tbody tr[data-index="1"]')).isDisplayed();
            const isTabRow2Visible = await driver.findElement(By.css('#openedTabList tbody tr[data-index="2"]')).isDisplayed();
            const isTabRow3Visible = await driver.findElement(By.css('#openedTabList tbody tr[data-index="3"]')).isDisplayed();

            const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png');
            assert.isFalse(isNoTabRowVisible);
            assert.isFalse(isTabRow1Visible);
            assert.isTrue(isTabRow2Visible);
            assert.isFalse(isTabRow3Visible);
        });

        it('Should filter opened tabs by title on input with two word', async () => {
            const firefoxConfig = webdriverRetriever.getFirefoxConfig();

            await driver.findElement(By.css('#headerTabFilter input')).sendKeys('not without');
            await sleep(500);

            const isNoTabRowVisible = await driver.findElement(By.css('#openedTabList tbody .noTabRow')).isDisplayed();
            const isTabRow1Visible = await driver.findElement(By.css('#openedTabList tbody tr[data-index="1"]')).isDisplayed();
            const isTabRow2Visible = await driver.findElement(By.css('#openedTabList tbody tr[data-index="2"]')).isDisplayed();
            const isTabRow3Visible = await driver.findElement(By.css('#openedTabList tbody tr[data-index="3"]')).isDisplayed();

            const expectedFaviconUrl = firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png');
            assert.isFalse(isNoTabRowVisible);
            assert.isFalse(isTabRow1Visible);
            assert.isTrue(isTabRow2Visible);
            assert.isTrue(isTabRow3Visible);
        });

        xit('Should filter opened tabs by url on input with one word', async () => {
            // TODO
        });

        xit('Should filter opened tabs by url on input with two word', async () => {
            // TODO
        });

        xit('Should show the no tab row in opened tabs list when the filter do not match any tab', async () => {
            // TODO
        });
    });

    describe('Followed tabs', () => {
        xit('Should filter followed tabs by title on input with one word', async () => {
            // TODO
        });

        xit('Should filter followed tabs by title on input with two word', async () => {
            // TODO
        });

        xit('Should filter followed tabs by url on input with one word', async () => {
            // TODO
        });

        xit('Should filter followed tabs by url on input with two word', async () => {
            // TODO
        });

        xit('Should show the no tab row in followed tabs list when the filter do not match any tab', async () => {
            // TODO
        });
    });

    xit('TODO reset button when input is empty', async () => {
        // TODO
    });

    xit('TODO reset button when input is non empty', async () => {
        // TODO
    });

    describe('Screenshots', () => {
        it('State of the filter block when empty, non focused', async () => {
            await browserInstructionSender.blurElement(driver, '#headerTabFilter input');
            await sleep(500);

            const headerElement = driver.findElement(By.css('#header'));
            await screenshotTaker.take('tab-filter-initial-state', headerElement);
        });

        it('State of the filter block when empty, focused', async () => {
            await browserInstructionSender.focusElement(driver, '#headerTabFilter input');
            await sleep(500);

            const headerElement = driver.findElement(By.css('#header'));
            await screenshotTaker.take('tab-filter-focus-state', headerElement);
        });

        it('State of the filter block when non empty, focused', async () => {
            await driver.findElement(By.css('#headerTabFilter input')).sendKeys('some text');
            await sleep(500);

            const headerElement = driver.findElement(By.css('#header'));
            await screenshotTaker.take('tab-filter-focus-state-with-text', headerElement);
        });

        it('State of the filter block when non empty, non focused', async () => {
            await driver.findElement(By.css('#headerTabFilter input')).sendKeys('some text');
            await browserInstructionSender.blurElement(driver, '#headerTabFilter input');
            await sleep(500);

            const headerElement = driver.findElement(By.css('#header'));
            await screenshotTaker.take('tab-filter-initial-state-with-text', headerElement);
        });
    });
});
