import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

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

    getMuteIndicator(tabRow: WebElement) {
        return tabRow.findElement(By.css('.muteIndicator'));
    }

    getAudibleIndicator(tabRow: WebElement) {
        return tabRow.findElement(By.css('.audibleIndicator'));
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

    getMuteButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.muteButton'));
    }

    getUnmuteButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.unmuteButton'));
    }

    getReloadButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.reloadButton'));
    }

    getCloseButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.closeButton'));
    }

    getTabLastAccessText(tabRow: WebElement) {
        return tabRow.findElement(By.css('.lastAccess')).getText();
    }

    async clickOnMoreButton(tabRow: WebElement) {
        await this.driver.findElement(By.tagName('body')).click();
        await sleep(100);
        const moreButton = tabRow.findElement(By.css('.more'));

        await moreButton.click();
    }

    async clickOnPinButton(tabRow: WebElement) {
        const pinButton = this.getPinButton(tabRow);
        const pinIndicator = this.getPinIndicator(tabRow);

        await this.clickOnMoreButton(tabRow);
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

        await this.clickOnMoreButton(tabRow);
        await unpinButton.click();
        await this.driver.wait(async () => {
            return await this.hasClass(pinIndicator, 'off');
        }, 3000);
    }

    async clickOnMuteButton(tabRow: WebElement, waitMuteIndicatorStateChange: boolean) {
        const muteButton = this.getMuteButton(tabRow);
        const muteIndicator = this.getMuteIndicator(tabRow);

        await this.clickOnMoreButton(tabRow);
        await muteButton.click();

        if (waitMuteIndicatorStateChange) {
            await this.driver.wait(async () => {
                return await this.hasClass(muteIndicator, 'on');
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnUnmuteButton(tabRow: WebElement, waitMuteIndicatorStateChange: boolean) {
        const unmuteButton = this.getUnmuteButton(tabRow);
        const muteIndicator = this.getMuteIndicator(tabRow);

        await this.clickOnMoreButton(tabRow);
        await unmuteButton.click();

        if (waitMuteIndicatorStateChange) {
            await this.driver.wait(async () => {
                return await this.hasClass(muteIndicator, 'off');
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnReloadButton(tabIndex: number, tabRow: WebElement) {
        const reloadButton = this.getReloadButton(tabRow);

        await this.clickOnMoreButton(tabRow);
        await reloadButton.click();
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(tabIndex);

            return 'complete' == tab.status;
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

    async assertTabMuteIndicatorIsOn(tabRow: WebElement) {
        const muteIndicator = this.getMuteIndicator(tabRow);
        await this.assertIndicatorIsOn(muteIndicator, 'Tab mute');
    }

    async assertTabMuteIndicatorIsOff(tabRow: WebElement) {
        const muteIndicator = this.getMuteIndicator(tabRow);
        await this.assertIndicatorIsOff(muteIndicator, 'Tab mute');
    }

    async assertTabAudibleIndicatorIsOn(tabRow: WebElement) {
        const audibleIndicator = this.getAudibleIndicator(tabRow);
        await this.assertIndicatorIsOn(audibleIndicator, 'Tab audible');
    }

    async assertTabAudibleIndicatorIsOff(tabRow: WebElement) {
        const audibleIndicator = this.getAudibleIndicator(tabRow);
        await this.assertIndicatorIsOff(audibleIndicator, 'Tab audible');
    }

    async assertUnfollowButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isUnfollowButtonDisplayed = await this.getUnfollowButton(tabRow).isDisplayed();
        assert.isTrue(isUnfollowButtonDisplayed, 'Tab unfollow button is not visible');
    }

    async assertUnfollowButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isUnfollowButtonDisplayed = await this.getUnfollowButton(tabRow).isDisplayed();
        assert.isFalse(isUnfollowButtonDisplayed, 'Tab unfollow button is visible');
    }

    async assertPinButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isPinButtonDisplayed = await this.getPinButton(tabRow).isDisplayed();
        assert.isTrue(isPinButtonDisplayed, 'Tab pin button is not visible');
    }

    async assertPinButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isPinButtonDisplayed = await this.getPinButton(tabRow).isDisplayed();
        assert.isFalse(isPinButtonDisplayed, 'Tab pin button is visible');
    }

    async assertPinButtonIsDisabled(tabRow: WebElement) {
        const pinButton = await this.getPinButton(tabRow);
        const pinButtonClasses = ('' + await pinButton.getAttribute('class')).split(' ');

        assert.include(pinButtonClasses, 'disabled');
    }

    async assertPinButtonIsNotDisabled(tabRow: WebElement) {
        const pinButton = await this.getPinButton(tabRow);
        const pinButtonClasses = ('' + await pinButton.getAttribute('class')).split(' ');

        assert.notInclude(pinButtonClasses, 'disabled');
    }

    async assertUnpinButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isUnpinButtonDisplayed = await this.getUnpinButton(tabRow).isDisplayed();
        assert.isTrue(isUnpinButtonDisplayed, 'Tab unpin button is not visible');
    }

    async assertUnpinButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isUnpinButtonDisplayed = await this.getUnpinButton(tabRow).isDisplayed();
        assert.isFalse(isUnpinButtonDisplayed, 'Tab unpin button is visible');
    }

    async assertMuteButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isMuteButtonDisplayed = await this.getMuteButton(tabRow).isDisplayed();
        assert.isTrue(isMuteButtonDisplayed, 'Tab mute button is not visible');
    }

    async assertMuteButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isMuteButtonDisplayed = await this.getMuteButton(tabRow).isDisplayed();
        assert.isFalse(isMuteButtonDisplayed, 'Tab mute button is visible');
    }

    async assertMuteButtonIsDisabled(tabRow: WebElement) {
        const muteButton = await this.getMuteButton(tabRow);
        const muteButtonClasses = ('' + await muteButton.getAttribute('class')).split(' ');

        assert.include(muteButtonClasses, 'disabled');
    }

    async assertMuteButtonIsNotDisabled(tabRow: WebElement) {
        const muteButton = await this.getMuteButton(tabRow);
        const muteButtonClasses = ('' + await muteButton.getAttribute('class')).split(' ');

        assert.notInclude(muteButtonClasses, 'disabled');
    }

    async assertUnmuteButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isUnmuteButtonDisplayed = await this.getUnmuteButton(tabRow).isDisplayed();
        assert.isTrue(isUnmuteButtonDisplayed, 'Tab unmute button is not visible');
    }

    async assertUnmuteButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isUnmuteButtonDisplayed = await this.getUnmuteButton(tabRow).isDisplayed();
        assert.isFalse(isUnmuteButtonDisplayed, 'Tab unmute button is visible');
    }

    async assertUnmuteButtonIsDisabled(tabRow: WebElement) {
        const unmuteButton = await this.getUnmuteButton(tabRow);
        const unmuteButtonClasses = ('' + await unmuteButton.getAttribute('class')).split(' ');

        assert.include(unmuteButtonClasses, 'disabled');
    }

    async assertUnmuteButtonIsNotDisabled(tabRow: WebElement) {
        const unmuteButton = await this.getUnmuteButton(tabRow);
        const unmuteButtonClasses = ('' + await unmuteButton.getAttribute('class')).split(' ');

        assert.notInclude(unmuteButtonClasses, 'disabled');
    }

    async assertReloadButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isReloadButtonDisplayed = await this.getReloadButton(tabRow).isDisplayed();
        assert.isTrue(isReloadButtonDisplayed, 'Tab reload button is not visible');
    }

    async assertReloadButtonIsDisabled(tabRow: WebElement) {
        const reloadButton = await this.getReloadButton(tabRow);
        const reloadButtonClasses = ('' + await reloadButton.getAttribute('class')).split(' ');

        assert.include(reloadButtonClasses, 'disabled');
    }

    async assertReloadButtonIsNotDisabled(tabRow: WebElement) {
        const reloadButton = await this.getReloadButton(tabRow);
        const reloadButtonClasses = ('' + await reloadButton.getAttribute('class')).split(' ');

        assert.notInclude(reloadButtonClasses, 'disabled');
    }

    async assertCloseButtonIsVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isCloseButtonDisplayed = await this.getCloseButton(tabRow).isDisplayed();
        assert.isTrue(isCloseButtonDisplayed, 'Tab close button is not visible');
    }

    async assertCloseButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnMoreButton(tabRow);
        const isCloseButtonDisplayed = await this.getCloseButton(tabRow).isDisplayed();
        assert.isFalse(isCloseButtonDisplayed, 'Tab close button is visible');
    }

    async assertCloseButtonIsDisabled(tabRow: WebElement) {
        const closeButton = await this.getCloseButton(tabRow);
        const closeButtonClasses = ('' + await closeButton.getAttribute('class')).split(' ');

        assert.include(closeButtonClasses, 'disabled');
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
