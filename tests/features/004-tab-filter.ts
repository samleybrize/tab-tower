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
    before(() => {
        webdriverRetriever = WebDriverRetriever.getInstance();
        driver = webdriverRetriever.getDriver();
        browserInstructionSender.init();
    });
    after(async () => {
        await driver.quit();
        browserInstructionSender.shutdown();
    });

    it('TODO state of the filter block when empty, non focused', async () => {
        const firefoxConfig = webdriverRetriever.getFirefoxConfig();
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));

        const headerElement = driver.findElement(By.css('#header'));
        await screenshotTaker.take('tab-filter-initial-state', headerElement);
    });

    it('TODO state of the filter block when empty, focused', async () => {
        await browserInstructionSender.focusElement(driver, '#headerTabFilter input');
        await sleep(500);

        const headerElement = driver.findElement(By.css('#header'));
        await screenshotTaker.take('tab-filter-focus-state', headerElement);
    });

    it('TODO state of the filter block when non empty, focused', async () => {
        await driver.findElement(By.css('#headerTabFilter input')).sendKeys('some text');
        await sleep(500);

        const headerElement = driver.findElement(By.css('#header'));
        await screenshotTaker.take('tab-filter-focus-state-with-text', headerElement);
    });

    it('TODO state of the filter block when non empty, non focused', async () => {
        await browserInstructionSender.blurElement(driver, '#headerTabFilter input');
        await sleep(500);

        const headerElement = driver.findElement(By.css('#header'));
        await screenshotTaker.take('tab-filter-initial-state-with-text', headerElement);
    });

    xit('TODO input, should filter opened/followed tabs', async () => {
        // TODO
    });

    xit('TODO reset button when input is empty', async () => {
        // TODO
    });

    xit('TODO reset button when input is non empty', async () => {
        // TODO
    });
});
