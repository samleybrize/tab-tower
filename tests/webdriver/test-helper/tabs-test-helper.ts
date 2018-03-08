import { assert } from 'chai';
import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';

export interface TabIndicator {
    on: WebElement;
    off: WebElement;
}

export class TabsTestHelper {
    constructor(
        private driver: WebDriver,
        private browserInstructionSender: BrowserInstructionSender,
    ) {
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
        return tabRow.findElement(By.css('.title span')).getText();
    }

    getTabUrlAttribute(tabRow: WebElement) {
        return tabRow.findElement(By.css('.title')).getAttribute('data-url');
    }

    getTabShownUrl(tabRow: WebElement) {
        return tabRow.findElement(By.css('.title em')).getText();
    }

    getTabFaviconUrl(tabRow: WebElement) {
        return tabRow.findElement(By.css('.title img')).getAttribute('src');
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

    getDuplicateButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.duplicateButton'));
    }

    getMoveButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.moveButton'));
    }

    getMoveBelowButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.moveBelow'));
    }

    getMoveAboveOthersButton(container: WebElement) {
        return container.findElement(By.css('thead .moveAboveOthers'));
    }

    getMoveCancelButton(container: WebElement) {
        return container.findElement(By.css('thead .moveModeCancel'));
    }

    getCloseButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.closeButton'));
    }

    getTabLastAccessText(tabRow: WebElement) {
        return tabRow.findElement(By.css('.lastAccess')).getText();
    }

    getTabSelectorLabel(tabRow: WebElement) {
        return tabRow.findElement(By.css('.tabSelector label'));
    }

    getTabSelectorInput(tabRow: WebElement) {
        return tabRow.findElement(By.css('.tabSelector input'));
    }

    getGeneralTabSelectorLabel(container: WebElement) {
        return container.findElement(By.css('thead .tabSelector label'));
    }

    getGeneralTabSelectorInput(container: WebElement) {
        return container.findElement(By.css('thead .tabSelector input'));
    }

    getSelectionTabMoreButton(container: WebElement) {
        return container.findElement(By.css('thead .more'));
    }

    async waitThatOnOffIndicatorIsFullyOn(indicatorElement: WebElement) {
        await this.driver.wait(async () => {
            return '1' == await indicatorElement.getCssValue('opacity');
        }, 3000);
        await sleep(500);
    }

    async waitThatReaderModeIndicatorIsFullyOn(tabRow: WebElement) {
        const indicator = this.getReaderModeIndicator(tabRow);
        await this.waitThatOnOffIndicatorIsFullyOn(indicator);
    }

    async waitThatPinIndicatorIsFullyOn(tabRow: WebElement) {
        const indicator = this.getPinIndicator(tabRow);
        await this.waitThatOnOffIndicatorIsFullyOn(indicator);
    }

    async waitThatMuteIndicatorIsFullyOn(tabRow: WebElement) {
        const indicator = this.getMuteIndicator(tabRow);
        await this.waitThatOnOffIndicatorIsFullyOn(indicator);
    }

    async waitThatAudibleIndicatorIsFullyOn(tabRow: WebElement) {
        const indicator = this.getAudibleIndicator(tabRow);
        await this.waitThatOnOffIndicatorIsFullyOn(indicator);
    }

    async waitThatSelectionTabMoreButtonIsFullyHidden(titleRow: WebElement) {
        const tabMoreButton = this.getSelectionTabMoreButton(titleRow);

        await this.driver.wait(async () => {
            return '0' == await tabMoreButton.getCssValue('opacity');
        }, 3000);
    }

    async hideMoreDropdown(tabRow: WebElement) {
        await this.driver.findElement(By.tagName('body')).click();
        const dropdownElement = tabRow.findElement(By.css('.tabRowDropdown'));

        await this.driver.wait(async () => {
            return 'none' == await dropdownElement.getCssValue('display');
        }, 3000);
        await sleep(500);
    }

    async clickOnTabMoreButton(tabRow: WebElement, waitFullyVisible?: boolean) {
        await this.browserInstructionSender.clickElement(this.driver, 'body');
        await sleep(300);
        const moreButton = tabRow.findElement(By.css('.more'));
        const dropdownElement = tabRow.findElement(By.css('.tabRowDropdown'));

        await moreButton.click();

        if (waitFullyVisible) {
            await this.driver.wait(async () => {
                return '1' == await dropdownElement.getCssValue('opacity');
            }, 3000);
        }
    }

    async clickOnSelectionTabCloseButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.closeButton')).click();

        await sleep(500);
    }

    async clickOnSelectionTabUnfollowButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.unfollowButton')).click();

        await sleep(500);
    }

    async clickOnTabPinButton(tabRow: WebElement, waitPinIndicatorStateChange: boolean) {
        const pinButton = this.getPinButton(tabRow);
        const pinIndicator = this.getPinIndicator(tabRow);

        await this.clickOnTabMoreButton(tabRow);
        await pinButton.click();

        if (waitPinIndicatorStateChange) {
            await this.driver.wait(async () => {
                return await this.hasClass(pinIndicator, 'on');
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnSelectionTabPinButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.pinButton')).click();

        await sleep(500);
    }

    async hasClass(element: WebElement, className: string) {
        const classAttribute = await element.getAttribute('class');

        if (null == classAttribute) {
            return false;
        }

        const classList = classAttribute.split(' ');

        return classList.indexOf(className) >= 0;
    }

    async clickOnTabUnpinButton(tabRow: WebElement) {
        const unpinButton = this.getUnpinButton(tabRow);
        const pinIndicator = this.getPinIndicator(tabRow);

        await this.clickOnTabMoreButton(tabRow);
        await unpinButton.click();
        await this.driver.wait(async () => {
            return await this.hasClass(pinIndicator, 'off');
        }, 3000);
    }

    async clickOnSelectionTabUnpinButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.unpinButton')).click();

        await sleep(500);
    }

    async clickOnTabMuteButton(tabRow: WebElement, waitMuteIndicatorStateChange: boolean) {
        const muteButton = this.getMuteButton(tabRow);
        const muteIndicator = this.getMuteIndicator(tabRow);

        await this.clickOnTabMoreButton(tabRow);
        await muteButton.click();

        if (waitMuteIndicatorStateChange) {
            await this.driver.wait(async () => {
                return await this.hasClass(muteIndicator, 'on');
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnSelectionTabMuteButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.muteButton')).click();

        await sleep(500);
    }

    async clickOnTabUnmuteButton(tabRow: WebElement, waitMuteIndicatorStateChange: boolean) {
        const unmuteButton = this.getUnmuteButton(tabRow);
        const muteIndicator = this.getMuteIndicator(tabRow);

        await this.clickOnTabMoreButton(tabRow);
        await unmuteButton.click();

        if (waitMuteIndicatorStateChange) {
            await this.driver.wait(async () => {
                return await this.hasClass(muteIndicator, 'off');
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnSelectionTabUnmuteButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.unmuteButton')).click();

        await sleep(500);
    }

    async clickOnTabReloadButton(tabIndex: number, tabRow: WebElement) {
        const reloadButton = this.getReloadButton(tabRow);

        await this.clickOnTabMoreButton(tabRow);
        await reloadButton.click();
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return 'complete' == tab.status;
        }, 3000);
    }

    async clickOnSelectionTabReloadButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await titleRow.findElement(By.css('.reloadButton')).click();

        await sleep(500);
    }

    async clickOnTabDuplicateButton(tabRow: WebElement, waitForNewTab: boolean) {
        const duplicateButton = this.getDuplicateButton(tabRow);
        const numberOfTabs = (await this.browserInstructionSender.getAllTabs()).length;

        await this.clickOnTabMoreButton(tabRow);
        await duplicateButton.click();

        if (waitForNewTab) {
            await this.driver.wait(async () => {
                const tabList = await this.browserInstructionSender.getAllTabs();
                const newNumberOfTabs = tabList.length;

                if (newNumberOfTabs == numberOfTabs) {
                    return false;
                } else if ('complete' != tabList[newNumberOfTabs - 1].status) {
                    return false;
                }

                return true;
            }, 3000);
        }

        await sleep(500);
    }

    async clickOnSelectionTabDuplicateButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await this.getDuplicateButton(titleRow).click();

        await sleep(1000);
    }

    async clickOnTabMoveButton(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        await this.getMoveButton(tabRow).click();

        await sleep(600);
    }

    async clickOnSelectionTabMoveButton(titleRow: WebElement) {
        await this.clickOnTabMoreButton(titleRow);
        await this.getMoveButton(titleRow).click();

        await sleep(500);
    }

    async clickOnTabMoveBelowButton(tabRow: WebElement) {
        await this.getMoveBelowButton(tabRow).click();

        await sleep(500);
    }

    async clickOnMoveAboveOthersButton(container: WebElement) {
        await this.getMoveAboveOthersButton(container).click();

        await sleep(500);
    }

    async clickOnTabMoveCancelButton(container: WebElement) {
        await this.getMoveCancelButton(container).click();

        await sleep(500);
    }

    async clickOnTabSelector(tabRow: WebElement) {
        const tabSelector = this.getTabSelectorLabel(tabRow);
        await tabSelector.click();
        await sleep(300);
    }

    async clickOnGeneralTabSelector(container: WebElement) {
        const tabSelector = this.getGeneralTabSelectorLabel(container);
        await tabSelector.click();
        await sleep(300);
    }

    async showElementTooltip(quotelessCssSelector: string) {
        this.browserInstructionSender.showElementTooltip(this.driver, quotelessCssSelector);
        await sleep(1000);
    }

    async assertNumberOfTabs(tabRowList: WebElement[], expectedNumberOfTabs: number) {
        assert.strictEqual(tabRowList.length, expectedNumberOfTabs);
    }

    async assertTabUrl(tabRow: WebElement, expectedUrl: string) {
        const tabUrlAttribute = await this.getTabUrlAttribute(tabRow);
        const tabShownUrl = await this.getTabShownUrl(tabRow);

        assert.equal(tabUrlAttribute, expectedUrl);
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

    async assertNoTabIndicatorIsVisible(containerElement: WebElement) {
        const indicatorList = await containerElement.findElements(By.css('.indicator'));

        for (const indicatorElement of indicatorList) {
            assert.isFalse(await indicatorElement.isDisplayed(), 'A tab indicator is visible');
        }
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

    async assertTabAudibleIndicatorTooltip(tabRow: WebElement, expectedText: string) {
        const audibleIndicator = this.getAudibleIndicator(tabRow);
        const tooltipText = await audibleIndicator.getAttribute('data-tooltip');
        assert.equal(tooltipText, expectedText);
    }

    async assertTabUnfollowButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isUnfollowButtonDisplayed = await this.getUnfollowButton(tabRow).isDisplayed();
        assert.isTrue(isUnfollowButtonDisplayed, 'Tab unfollow button is not visible');
    }

    async assertTabUnfollowButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isUnfollowButtonDisplayed = await this.getUnfollowButton(tabRow).isDisplayed();
        assert.isFalse(isUnfollowButtonDisplayed, 'Tab unfollow button is visible');
    }

    async assertTabPinButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isPinButtonDisplayed = await this.getPinButton(tabRow).isDisplayed();
        assert.isTrue(isPinButtonDisplayed, 'Tab pin button is not visible');
    }

    async assertTabPinButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isPinButtonDisplayed = await this.getPinButton(tabRow).isDisplayed();
        assert.isFalse(isPinButtonDisplayed, 'Tab pin button is visible');
    }

    async assertTabPinButtonIsDisabled(tabRow: WebElement) {
        const pinButton = await this.getPinButton(tabRow);
        const pinButtonClasses = ('' + await pinButton.getAttribute('class')).split(' ');

        assert.include(pinButtonClasses, 'disabled');
    }

    async assertTabPinButtonIsNotDisabled(tabRow: WebElement) {
        const pinButton = await this.getPinButton(tabRow);
        const pinButtonClasses = ('' + await pinButton.getAttribute('class')).split(' ');

        assert.notInclude(pinButtonClasses, 'disabled');
    }

    async assertTabUnpinButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isUnpinButtonDisplayed = await this.getUnpinButton(tabRow).isDisplayed();
        assert.isTrue(isUnpinButtonDisplayed, 'Tab unpin button is not visible');
    }

    async assertTabUnpinButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isUnpinButtonDisplayed = await this.getUnpinButton(tabRow).isDisplayed();
        assert.isFalse(isUnpinButtonDisplayed, 'Tab unpin button is visible');
    }

    async assertTabMuteButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isMuteButtonDisplayed = await this.getMuteButton(tabRow).isDisplayed();
        assert.isTrue(isMuteButtonDisplayed, 'Tab mute button is not visible');
    }

    async assertTabMuteButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isMuteButtonDisplayed = await this.getMuteButton(tabRow).isDisplayed();
        assert.isFalse(isMuteButtonDisplayed, 'Tab mute button is visible');
    }

    async assertTabMuteButtonIsDisabled(tabRow: WebElement) {
        const muteButton = await this.getMuteButton(tabRow);
        const muteButtonClasses = ('' + await muteButton.getAttribute('class')).split(' ');

        assert.include(muteButtonClasses, 'disabled');
    }

    async assertTabMuteButtonIsNotDisabled(tabRow: WebElement) {
        const muteButton = await this.getMuteButton(tabRow);
        const muteButtonClasses = ('' + await muteButton.getAttribute('class')).split(' ');

        assert.notInclude(muteButtonClasses, 'disabled');
    }

    async assertTabUnmuteButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isUnmuteButtonDisplayed = await this.getUnmuteButton(tabRow).isDisplayed();
        assert.isTrue(isUnmuteButtonDisplayed, 'Tab unmute button is not visible');
    }

    async assertTabUnmuteButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isUnmuteButtonDisplayed = await this.getUnmuteButton(tabRow).isDisplayed();
        assert.isFalse(isUnmuteButtonDisplayed, 'Tab unmute button is visible');
    }

    async assertTabUnmuteButtonIsDisabled(tabRow: WebElement) {
        const unmuteButton = await this.getUnmuteButton(tabRow);
        const unmuteButtonClasses = ('' + await unmuteButton.getAttribute('class')).split(' ');

        assert.include(unmuteButtonClasses, 'disabled');
    }

    async assertTabUnmuteButtonIsNotDisabled(tabRow: WebElement) {
        const unmuteButton = await this.getUnmuteButton(tabRow);
        const unmuteButtonClasses = ('' + await unmuteButton.getAttribute('class')).split(' ');

        assert.notInclude(unmuteButtonClasses, 'disabled');
    }

    async assertTabReloadButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isReloadButtonDisplayed = await this.getReloadButton(tabRow).isDisplayed();
        assert.isTrue(isReloadButtonDisplayed, 'Tab reload button is not visible');
    }

    async assertTabReloadButtonIsDisabled(tabRow: WebElement) {
        const reloadButton = await this.getReloadButton(tabRow);
        const reloadButtonClasses = ('' + await reloadButton.getAttribute('class')).split(' ');

        assert.include(reloadButtonClasses, 'disabled');
    }

    async assertTabReloadButtonIsNotDisabled(tabRow: WebElement) {
        const reloadButton = await this.getReloadButton(tabRow);
        const reloadButtonClasses = ('' + await reloadButton.getAttribute('class')).split(' ');

        assert.notInclude(reloadButtonClasses, 'disabled');
    }

    async assertTabDuplicateButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isDuplicateButtonDisplayed = await this.getDuplicateButton(tabRow).isDisplayed();
        assert.isTrue(isDuplicateButtonDisplayed, 'Tab reload button is not visible');
    }

    async assertTabDuplicateButtonIsDisabled(tabRow: WebElement) {
        const duplicateButton = await this.getDuplicateButton(tabRow);
        const duplicateButtonClasses = ('' + await duplicateButton.getAttribute('class')).split(' ');

        assert.include(duplicateButtonClasses, 'disabled');
    }

    async assertTabDuplicateButtonIsNotDisabled(tabRow: WebElement) {
        const duplicateButton = await this.getDuplicateButton(tabRow);
        const duplicateButtonClasses = ('' + await duplicateButton.getAttribute('class')).split(' ');

        assert.notInclude(duplicateButtonClasses, 'disabled');
    }

    async assertTabCloseButtonIsVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isCloseButtonDisplayed = await this.getCloseButton(tabRow).isDisplayed();
        assert.isTrue(isCloseButtonDisplayed, 'Tab close button is not visible');
    }

    async assertTabCloseButtonIsNotVisible(tabRow: WebElement) {
        await this.clickOnTabMoreButton(tabRow);
        const isCloseButtonDisplayed = await this.getCloseButton(tabRow).isDisplayed();
        assert.isFalse(isCloseButtonDisplayed, 'Tab close button is visible');
    }

    async assertTabCloseButtonIsDisabled(tabRow: WebElement) {
        const closeButton = await this.getCloseButton(tabRow);
        const closeButtonClasses = ('' + await closeButton.getAttribute('class')).split(' ');

        assert.include(closeButtonClasses, 'disabled');
    }

    async assertTabLastAccessDateIsRoughlyEqualToDate(tabRow: WebElement, date: Date) {
        const lastAccessText = await this.getTabLastAccessText(tabRow);
        const lastAccessDate = new Date(lastAccessText);
        const lastAccessTimestamp = lastAccessDate.getTime();
        const toleranceInSeconds = 10;

        const minAcceptedTimestamp = lastAccessTimestamp - toleranceInSeconds;
        const maxAcceptedTimestamp = lastAccessTimestamp + toleranceInSeconds;

        const isDateAccepted = lastAccessTimestamp >= minAcceptedTimestamp && lastAccessTimestamp <= maxAcceptedTimestamp;
        assert.isTrue(isDateAccepted, 'Shown tab last access date is not acceptable');
    }

    async assertTabLastAccessDateIsEqualToString(tabRow: WebElement, text: string) {
        const lastAccessText = await this.getTabLastAccessText(tabRow);

        assert.equal(text, lastAccessText);
    }

    async assertNoTooltipVisible(containerElement: WebElement) {
        const tooltipElementList = await containerElement.findElements(By.css('.material-tooltip'));

        for (const tooltipElement of tooltipElementList) {
            if (await tooltipElement.isDisplayed()) {
                assert.fail(true, false, 'At least one tooltip is visible');

                break;
            }
        }
    }

    async assertNoTabSelectorIsVisible(containerElement: WebElement) {
        const tabSelectorList = await containerElement.findElements(By.css('.tabSelector, .tabSelector'));

        for (const tabSelectorElement of tabSelectorList) {
            assert.isFalse(await tabSelectorElement.isDisplayed(), 'A tab selector is visible');
        }
    }

    async assertTabSelectorIsChecked(tabRow: WebElement) {
        const isChecked = await this.getTabSelectorInput(tabRow).isSelected();

        assert.isTrue(isChecked, 'Tab selector is not checked');
    }

    async assertTabSelectorIsNotChecked(tabRow: WebElement) {
        const isChecked = await this.getTabSelectorInput(tabRow).isSelected();

        assert.isFalse(isChecked, 'Tab selector is checked');
    }

    async assertGeneralTabSelectorIsChecked(container: WebElement) {
        const isChecked = await this.getGeneralTabSelectorInput(container).isSelected();

        assert.isTrue(isChecked, 'Title tab selector is not checked');
    }

    async assertGeneralTabSelectorIsNotChecked(container: WebElement) {
        const isChecked = await this.getGeneralTabSelectorInput(container).isSelected();

        assert.isFalse(isChecked, 'Title tab selector is checked');
    }

    async assertNoTabMoreButtonIsVisible(containerElement: WebElement) {
        const moreList = await containerElement.findElements(By.css('.more'));

        for (const moreElement of moreList) {
            assert.isFalse(await moreElement.isDisplayed(), 'A more button is visible');
        }
    }

    async assertSelectionTabMoreButtonIsVisible(container: WebElement) {
        const isDisplayed = await this.getSelectionTabMoreButton(container).isDisplayed();

        assert.isTrue(isDisplayed, 'Title tab more button is not visible');
    }

    async assertSelectionTabMoreButtonIsNotVisible(container: WebElement) {
        const isDisplayed = await this.getSelectionTabMoreButton(container).isDisplayed();

        assert.isFalse(isDisplayed, 'Title tab more button is visible');
    }

    async assertTabMoveBelowButtonIsVisible(tabRow: WebElement) {
        const isDisplayed = await this.getMoveBelowButton(tabRow).isDisplayed();

        assert.isTrue(isDisplayed, 'Move below button is not visible');
    }

    async assertMoveAboveOthersButtonIsVisible(containerElement: WebElement) {
        const isDisplayed = await this.getMoveAboveOthersButton(containerElement).isDisplayed();

        assert.isTrue(isDisplayed, 'Move above others button is not visible');
    }

    async assertTabIsBeingMoved(tabRow: WebElement) {
        const hasBeingMovedClass = await this.hasClass(tabRow, 'beingMoved');
        const isMoveIndicatorVisible = await tabRow.findElement(By.css('.beingMovedIndicator')).isDisplayed();

        assert.isTrue(hasBeingMovedClass, 'Tab row has not the "beingMoved" class');
        assert.isTrue(isMoveIndicatorVisible, 'Tab row move indicator is not visible');
    }

    async assertTabIsNotBeingMoved(tabRow: WebElement) {
        const hasBeingMovedClass = await this.hasClass(tabRow, 'beingMoved');
        const isMoveIndicatorVisible = await tabRow.findElement(By.css('.beingMovedIndicator')).isDisplayed();

        assert.isFalse(hasBeingMovedClass, 'Tab row has the "beingMoved" class');
        assert.isFalse(isMoveIndicatorVisible, 'Tab row move indicator is visible');
    }
}
