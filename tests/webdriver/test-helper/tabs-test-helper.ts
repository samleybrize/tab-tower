import { assert } from 'chai';
import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';

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
        return tabRow.findElement(By.css('.readerModeIndicator'));
    }

    getPinIndicator(tabRow: WebElement) {
        return tabRow.findElement(By.css('.pinIndicator'));
    }

    getUnfollowButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.unfollowButton'));
    }

    getPinButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.pinButton'));
    }

    getUnpinButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.unpinButton'));
    }

    getCloseButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.closeButton'));
    }

    getTabLastAccessText(tabRow: WebElement) {
        return tabRow.findElement(By.css('.lastAccess')).getText();
    }

    async clickOnPinButton(tabRow: WebElement) {
        const pinButton = this.getPinButton(tabRow);
        const pinIndicator = this.getPinIndicator(tabRow);

        await pinButton.click();
        await this.driver.wait(async () => {
            return await this.hasClass(pinIndicator, 'on');
        }, 3000);
    }

    async hasClass(element: WebElement, className: string) {
        const classAttribute = await element.getAttribute('class');

        if (null == classAttribute) {
            return false;
        }

        const classList = classAttribute.split(' ');

        return classList.indexOf(className) >= 0;
    }

    async clickOnUnpinButton(tabRow: WebElement) {
        const unpinButton = this.getUnpinButton(tabRow);
        const pinIndicator = this.getPinIndicator(tabRow);

        await unpinButton.click();
        await this.driver.wait(async () => {
            return await this.hasClass(pinIndicator, 'off');
        }, 3000);
    }

    async showElementTooltip(quotelessCssSelector: string) {
        this.browserInstructionSender.showElementTooltip(this.driver, quotelessCssSelector);
        await sleep(1000);
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

    async assertTabTitleTooltip(tabRow: WebElement, expectedText: string) {
        const tooltipText = await tabRow.findElement(By.css('.title')).getAttribute('data-tooltip');
        assert.equal(tooltipText, expectedText);
    }

    async assertNoTabRowIsVisible(noTabRow: WebElement) {
        assert.isTrue(await noTabRow.isDisplayed(), 'The no tab row is not visible');
    }

    async assertNoTabRowIsNotVisible(noTabRow: WebElement) {
        assert.isFalse(await noTabRow.isDisplayed(), 'The no tab row is visible');
    }

    async assertTabRowIsVisible(tabRow: WebElement) {
        assert.isTrue(await tabRow.isDisplayed(), 'Tab row is not visible');
    }

    async assertTabRowIsNotVisible(tabRow: WebElement) {
        assert.isFalse(await tabRow.isDisplayed(), 'Tab row is visible');
    }

    async assertTabReaderModeIndicatorIsOn(tabRow: WebElement) {
        const readerModeIndicator = this.getReaderModeIndicator(tabRow);
        await this.assertIndicatorIsOn(readerModeIndicator, 'Tab reader mode');
    }

    async assertTabReaderModeIndicatorIsOff(tabRow: WebElement) {
        const readerModeIndicator = this.getReaderModeIndicator(tabRow);
        await this.assertIndicatorIsOff(readerModeIndicator, 'Tab reader mode');
    }

    async assertIndicatorIsOn(indicator: WebElement, subject: string) {
        assert.isTrue(await this.hasClass(indicator, 'on'), `${subject} indicator is not on`);
    }

    async assertIndicatorIsOff(indicator: WebElement, subject: string) {
        assert.isTrue(await this.hasClass(indicator, 'off'), `${subject} indicator is not off`);
    }

    async assertTabPinIndicatorIsOn(tabRow: WebElement) {
        const pinIndicator = this.getPinIndicator(tabRow);
        await this.assertIndicatorIsOn(pinIndicator, 'Tab pin');
    }

    async assertTabPinIndicatorIsOff(tabRow: WebElement) {
        const pinIndicator = this.getPinIndicator(tabRow);
        await this.assertIndicatorIsOff(pinIndicator, 'Tab pin');
    }

    async assertUnfollowButtonIsVisible(tabRow: WebElement) {
        const isUnfollowButtonDisplayed = await this.getUnfollowButton(tabRow).isDisplayed();
        assert.isTrue(isUnfollowButtonDisplayed, 'Tab unfollow button is not visible');
    }

    async assertUnfollowButtonIsNotVisible(tabRow: WebElement) {
        const isUnfollowButtonDisplayed = await this.getUnfollowButton(tabRow).isDisplayed();
        assert.isFalse(isUnfollowButtonDisplayed, 'Tab unfollow button is visible');
    }

    async assertPinButtonIsVisible(tabRow: WebElement) {
        const isPinButtonDisplayed = await this.getPinButton(tabRow).isDisplayed();
        assert.isTrue(isPinButtonDisplayed, 'Tab pin button is not visible');
    }

    async assertPinButtonIsNotVisible(tabRow: WebElement) {
        const isPinButtonDisplayed = await this.getPinButton(tabRow).isDisplayed();
        assert.isFalse(isPinButtonDisplayed, 'Tab pin button is visible');
    }

    async assertUnpinButtonIsVisible(tabRow: WebElement) {
        const isUnpinButtonDisplayed = await this.getUnpinButton(tabRow).isDisplayed();
        assert.isTrue(isUnpinButtonDisplayed, 'Tab unpin button is not visible');
    }

    async assertUnpinButtonIsNotVisible(tabRow: WebElement) {
        const isUnpinButtonDisplayed = await this.getUnpinButton(tabRow).isDisplayed();
        assert.isFalse(isUnpinButtonDisplayed, 'Tab unpin button is visible');
    }

    async assertCloseButtonIsVisible(tabRow: WebElement) {
        const isCloseButtonDisplayed = await this.getCloseButton(tabRow).isDisplayed();
        assert.isTrue(isCloseButtonDisplayed, 'Tab close button is not visible');
    }

    async assertCloseButtonIsNotVisible(tabRow: WebElement) {
        const isCloseButtonDisplayed = await this.getCloseButton(tabRow).isDisplayed();
        assert.isFalse(isCloseButtonDisplayed, 'Tab close button is visible');
    }

    async assertLastAccessDateIsRoughlyEqualToDate(tabRow: WebElement, date: Date) {
        const lastAccessText = await this.getTabLastAccessText(tabRow);
        const lastAccessDate = new Date(lastAccessText);
        const lastAccessTimestamp = lastAccessDate.getTime();
        const toleranceInSeconds = 10;

        const minAcceptedTimestamp = lastAccessTimestamp - toleranceInSeconds;
        const maxAcceptedTimestamp = lastAccessTimestamp + toleranceInSeconds;

        const isDateAccepted = lastAccessTimestamp >= minAcceptedTimestamp && lastAccessTimestamp <= maxAcceptedTimestamp;
        assert.isTrue(isDateAccepted, 'Shown tab last access date is not acceptable');
    }

    async assertLastAccessDateIsEqualToString(tabRow: WebElement, text: string) {
        const lastAccessText = await this.getTabLastAccessText(tabRow);

        assert.equal(text, lastAccessText);
    }
}
