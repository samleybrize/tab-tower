import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../browser-instruction-sender';
import { WebDriverRetriever } from '../webdriver-retriever';

export interface TabIndicator {
    on: WebElement;
    off: WebElement;
}

export class TabsTestHelper {
    constructor(private driver: WebDriver, private browserInstructionSender: BrowserInstructionSender) {
    }

    async getNumberOfTabsWithUrl(titleElementList: WebElement[], url: string) {
        let count = 0;

        for (const titleElement of titleElementList) {
            if (url == await titleElement.getAttribute('data-url')) {
                count++;
            }
        }

        return count;
    }

    getTabTitle(tabRow: WebElement) {
        return tabRow.findElement(By.css('.title a span')).getText();
    }

    getTabUrl(tabRow: WebElement) {
        return tabRow.findElement(By.css('.title a')).getAttribute('data-url');
    }

    getTabFaviconUrl(tabRow: WebElement) {
        return tabRow.findElement(By.css('.title a img')).getAttribute('src');
    }

    getReaderModeIndicator(tabRow: WebElement) {
        return {
            on: tabRow.findElement(By.css('.readerModeIndicator .on')),
            off: tabRow.findElement(By.css('.readerModeIndicator .off')),
        };
    }

    async assertNumberOfTabs(tabRowList: WebElement[], expectedNumberOfTabs: number) {
        assert.strictEqual(tabRowList.length, expectedNumberOfTabs);
    }

    async assertTabUrl(tabRow: WebElement, expectedUrl: string) {
        const tabShownUrl = await this.getTabUrl(tabRow);
        assert.equal(tabShownUrl, expectedUrl);
    }

    async assertTabFaviconUrl(tabRow: WebElement, expectedFaviconUrl: string) {
        const tabShownFaviconUrl = await this.getTabFaviconUrl(tabRow);
        assert.equal(tabShownFaviconUrl, expectedFaviconUrl);
    }

    async assertTabTitle(tabRow: WebElement, expectedTitle: string) {
        const tabShownTitle = await this.getTabTitle(tabRow);
        assert.equal(tabShownTitle, expectedTitle);
    }

    async assertNoTabRowIsVisible(noTabRow: WebElement) {
        assert.isTrue(await noTabRow.isDisplayed());
    }

    async assertNoTabRowIsNotVisible(noTabRow: WebElement) {
        assert.isFalse(await noTabRow.isDisplayed());
    }

    async assertTabReaderModeIndicatorIsOn(tabRow: WebElement) {
        const readerModeIndicator = this.getReaderModeIndicator(tabRow);
        await this.assertIndicatorIsOn(readerModeIndicator);
    }

    async assertTabReaderModeIndicatorIsOff(tabRow: WebElement) {
        const readerModeIndicator = this.getReaderModeIndicator(tabRow);
        await this.assertIndicatorIsOff(readerModeIndicator);
    }

    async assertIndicatorIsOn(indicator: TabIndicator) {
        assert.isTrue(await indicator.on.isDisplayed());
        assert.isFalse(await indicator.off.isDisplayed());
    }

    async assertIndicatorIsOff(indicator: TabIndicator) {
        assert.isFalse(await indicator.on.isDisplayed());
        assert.isTrue(await indicator.off.isDisplayed());
    }
}
