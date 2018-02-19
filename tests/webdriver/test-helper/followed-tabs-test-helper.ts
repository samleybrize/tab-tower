import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';
import { TabsTestHelper } from './tabs-test-helper';

export class FollowedTabsTestHelper {
    constructor(private tabsTestHelper: TabsTestHelper, private driver: WebDriver, private browserInstructionSender: BrowserInstructionSender) {
    }

    async getTabRowList() {
        return this.driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
    }

    async getTabRowByOpenedTabId(openedTabId: number) {
        const rowList = await this.driver.findElements(By.css(`#followedTabList tbody tr[data-opened-tab-id="${openedTabId}"]`));

        return rowList.length ? rowList[0] : null;
    }

    getNoTabRow() {
        return this.driver.findElement(By.css('#followedTabList tbody .noTabRow'));
    }

    async hideMoreDropdown(tabRow: WebElement) {
        await this.tabsTestHelper.hideMoreDropdown(tabRow);
    }

    async clickOnTabMoreButton(tabRow: WebElement, waitFullyVisible?: boolean) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow, !!waitFullyVisible);
    }

    async clickOnTabCloseButton(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);

        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await tabRow.findElement(By.css('.closeButton')).click();
        await this.driver.wait(async () => {
            return await this.tabsTestHelper.hasClass(openIndicator, 'off');
        }, 3000);
    }

    async clickOnTabTitle(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);
        const tabId = await this.getWebElementAttribute(tabRow, 'data-opened-tab-id');

        const titleElement = tabRow.findElement(By.css('.title a'));
        await titleElement.click();

        await this.driver.wait(async () => {
            if (null !== tabId) {
                return +tabId === (await this.browserInstructionSender.getActiveTab()).id;
            } else {
                return await this.tabsTestHelper.hasClass(openIndicator, 'on');
            }
        }, 10000);
        await sleep(200);
    }

    async clickTwoTimesOnTabTitle(tabRow: WebElement) {
        const tabId = await this.getWebElementAttribute(tabRow, 'data-opened-tab-id');
        let url: string;

        if (null === tabId) {
            url = await this.getWebElementAttribute(tabRow.findElement(By.css('.title a')), 'data-url');
        }

        const titleElement = tabRow.findElement(By.css('.title a'));

        await Promise.all([
            titleElement.click(),
            titleElement.click(),
        ]);
        await sleep(200);

        if (null !== tabId) {
            await this.driver.wait(async () => {
                return +tabId === (await this.browserInstructionSender.getActiveTab()).id;
            }, 10000);
        } else {
            await this.driver.wait(async () => {
                let numberOfMatchingTabs = 0;
                const tabList = await this.browserInstructionSender.getAllTabs();

                for (const tab of tabList) {
                    if (tab.url != url) {
                        continue;
                    }

                    numberOfMatchingTabs++;

                    if ('complete' != tab.status) {
                        return false;
                    }
                }

                if (0 == numberOfMatchingTabs) {
                    return false;
                }

                return true;
            }, 10000);
            await sleep(200);
        }
    }

    private async getWebElementAttribute(element: WebElement, attributeName: string) {
        let attributeValue = await element.getAttribute(attributeName);

        if ('null' == attributeValue) {
            attributeValue = null;
        }

        return attributeValue;
    }

    async clickOnTabUnfollowButton(tabRow: WebElement) {
        const unfollowButton = this.getUnfollowButton(tabRow);

        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await unfollowButton.click();
        await this.driver.wait(async () => {
            try {
                await tabRow.isDisplayed();
            } catch (error) {
                if (error instanceof WebDriverError.StaleElementReferenceError) {
                    return true;
                }
            }
        }, 3000);
    }

    async clickOnTabPinButton(tabRow: WebElement, waitPinIndicatorStateChange?: boolean) {
        if (undefined === waitPinIndicatorStateChange) {
            waitPinIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnTabPinButton(tabRow, waitPinIndicatorStateChange);
    }

    async clickOnTabUnpinButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabUnpinButton(tabRow);
    }

    async clickOnTabMuteButton(tabRow: WebElement, waitMuteIndicatorStateChange?: boolean) {
        if (undefined === waitMuteIndicatorStateChange) {
            waitMuteIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnTabMuteButton(tabRow, waitMuteIndicatorStateChange);
    }

    async clickOnTabUnmuteButton(tabRow: WebElement, waitMuteIndicatorStateChange?: boolean) {
        if (undefined === waitMuteIndicatorStateChange) {
            waitMuteIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnTabUnmuteButton(tabRow, waitMuteIndicatorStateChange);
    }

    async clickOnTabReloadButton(tabIndex: number, tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabReloadButton(tabIndex, tabRow);
    }

    async clickOnTabDuplicateButton(tabRow: WebElement, waitForNewTab?: boolean) {
        if (undefined === waitForNewTab) {
            waitForNewTab = true;
        }

        await this.tabsTestHelper.clickOnTabDuplicateButton(tabRow, waitForNewTab);
    }

    async showTitleTooltip(tabRow: WebElement) {
        const followId = await tabRow.getAttribute('data-follow-id');
        await this.tabsTestHelper.showElementTooltip(`#followedTabList tbody tr[data-follow-id="${followId}"] .title a`);
    }

    async getNumberOfTabsWithUrl(url?: string) {
        const titleElementList = await this.driver.findElements(By.css('#followedTabList tbody tr[data-follow-id] .title a'));

        return this.tabsTestHelper.getNumberOfTabsWithUrl(titleElementList, url);
    }

    getTabTitle(tabRow: WebElement) {
        return this.tabsTestHelper.getTabTitle(tabRow);
    }

    getTabUrlAttribute(tabRow: WebElement) {
        return this.tabsTestHelper.getTabUrlAttribute(tabRow);
    }

    getTabFaviconUrl(tabRow: WebElement) {
        return this.tabsTestHelper.getTabFaviconUrl(tabRow);
    }

    getOpenIndicator(tabRow: WebElement) {
        return tabRow.findElement(By.css('.openIndicator'));
    }

    getUnfollowButton(tabRow: WebElement) {
        return this.tabsTestHelper.getUnfollowButton(tabRow);
    }

    async waitThatReaderModeIndicatorIsFullyOn(tabRow: WebElement) {
        await this.tabsTestHelper.waitThatReaderModeIndicatorIsFullyOn(tabRow);
    }

    async waitThatPinIndicatorIsFullyOn(tabRow: WebElement) {
        await this.tabsTestHelper.waitThatPinIndicatorIsFullyOn(tabRow);
    }

    async waitThatMuteIndicatorIsFullyOn(tabRow: WebElement) {
        await this.tabsTestHelper.waitThatMuteIndicatorIsFullyOn(tabRow);
    }

    async waitThatAudibleIndicatorIsFullyOn(tabRow: WebElement) {
        await this.tabsTestHelper.waitThatAudibleIndicatorIsFullyOn(tabRow);
    }

    async waitThatOpenIndicatorIsFullyOn(tabRow: WebElement) {
        const indicator = this.getOpenIndicator(tabRow);
        await this.tabsTestHelper.waitThatOnOffIndicatorIsFullyOn(indicator);
    }

    async changeTabLastAccessText(tabRow: WebElement, newText: string) {
        const followId = await tabRow.getAttribute('data-follow-id');
        await this.driver.executeScript(`
            const element = document.querySelector('#followedTabList tbody tr[data-follow-id="${followId}"] .lastAccess');

            if (element) {
                element.innerText = '${newText}';
            }
        `);
    }

    async toggleFollowedTabReaderModeIndicator(tabRow: WebElement) {
        const followId = await tabRow.getAttribute('data-follow-id');
        await this.driver.executeScript(`
            const readerModeIndicator = document.querySelector('#followedTabList tbody tr[data-follow-id="${followId}"] .readerModeIndicator');

            if (readerModeIndicator.classList.contains('on')) {
                readerModeIndicator.classList.remove('on');
                readerModeIndicator.classList.add('off');
            } else {
                readerModeIndicator.classList.add('on');
                readerModeIndicator.classList.remove('off');
            }
        `);
        await sleep(700);
    }

    async setFollowedTabReaderModeStatusAsDisabled(tabRow: WebElement) {
        const followId = await tabRow.getAttribute('data-follow-id');
        await this.browserInstructionSender.setFollowedTabReaderModeStatusAsDisabled(followId);
        await sleep(500);
    }

    async assertNumberOfTabs(expectedNumberOfTabs: number) {
        const followedTabRowList = await this.getTabRowList();
        await this.tabsTestHelper.assertNumberOfTabs(followedTabRowList, expectedNumberOfTabs);
    }

    async assertTabUrl(tabRow: WebElement, expectedUrl: string) {
        await this.tabsTestHelper.assertTabUrl(tabRow, expectedUrl);
    }

    async assertTabFaviconUrl(tabRow: WebElement, expectedFaviconUrl: string) {
        await this.tabsTestHelper.assertTabFaviconUrl(tabRow, expectedFaviconUrl);
    }

    async assertTabTitle(tabRow: WebElement, expectedTitle: string) {
        await this.tabsTestHelper.assertTabTitle(tabRow, expectedTitle);
    }

    async assertTabTitleTooltip(tabRow: WebElement, expectedText: string) {
        await this.tabsTestHelper.assertTabTitleTooltip(tabRow, expectedText);
    }

    async assertNoTabRowIsVisible() {
        const noTabRow = this.getNoTabRow();
        await this.tabsTestHelper.assertNoTabRowIsVisible(noTabRow);
    }

    async assertNoTabRowIsNotVisible() {
        const noTabRow = this.getNoTabRow();
        await this.tabsTestHelper.assertNoTabRowIsNotVisible(noTabRow);
    }

    async assertTabRowIsVisible(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabRowIsVisible(tabRow);
    }

    async assertTabRowIsNotVisible(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabRowIsNotVisible(tabRow);
    }

    async assertTabReaderModeIndicatorIsOn(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabReaderModeIndicatorIsOn(tabRow);
    }

    async assertTabReaderModeIndicatorIsOff(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabReaderModeIndicatorIsOff(tabRow);
    }

    async assertTabReaderModeTestPageTitle(tabRow: WebElement) {
        const title = await tabRow.findElement(By.css('.title a')).getText();
        assert.match(title, /mozilla/i);
        assert.notMatch(title, /http/i);
    }

    async assertTabPinIndicatorIsOn(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabPinIndicatorIsOn(tabRow);
    }

    async assertTabPinIndicatorIsOff(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabPinIndicatorIsOff(tabRow);
    }

    async assertTabMuteIndicatorIsOn(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabMuteIndicatorIsOn(tabRow);
    }

    async assertTabMuteIndicatorIsOff(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabMuteIndicatorIsOff(tabRow);
    }

    async assertTabAudibleIndicatorIsOn(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabAudibleIndicatorIsOn(tabRow);
    }

    async assertTabAudibleIndicatorIsOff(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabAudibleIndicatorIsOff(tabRow);
    }

    async assertTabAudibleIndicatorTooltip(tabRow: WebElement, expectedText: string) {
        await this.tabsTestHelper.assertTabAudibleIndicatorTooltip(tabRow, expectedText);
    }

    async assertTabOpenIndicatorIsOn(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);
        await this.tabsTestHelper.assertIndicatorIsOn(openIndicator, 'Tab open');
    }

    async assertTabOpenIndicatorIsOff(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);
        await this.tabsTestHelper.assertIndicatorIsOff(openIndicator, 'Tab open');
    }

    async assertTabUnfollowButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnfollowButtonIsVisible(tabRow);
    }

    async assertTabPinButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabPinButtonIsVisible(tabRow);
    }

    async assertTabPinButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabPinButtonIsNotVisible(tabRow);
    }

    async assertTabPinButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabPinButtonIsDisabled(tabRow);
    }

    async assertTabPinButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabPinButtonIsNotDisabled(tabRow);
    }

    async assertTabUnpinButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnpinButtonIsVisible(tabRow);
    }

    async assertTabUnpinButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnpinButtonIsNotVisible(tabRow);
    }

    async assertTabMuteButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabMuteButtonIsVisible(tabRow);
    }

    async assertTabMuteButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabMuteButtonIsNotVisible(tabRow);
    }

    async assertTabMuteButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabMuteButtonIsDisabled(tabRow);
    }

    async assertTabMuteButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabMuteButtonIsNotDisabled(tabRow);
    }

    async assertTabUnmuteButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnmuteButtonIsVisible(tabRow);
    }

    async assertTabUnmuteButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnmuteButtonIsNotVisible(tabRow);
    }

    async assertTabUnmuteButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnmuteButtonIsDisabled(tabRow);
    }

    async assertTabUnmuteButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnmuteButtonIsNotDisabled(tabRow);
    }

    async assertTabReloadButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabReloadButtonIsVisible(tabRow);
    }

    async assertTabReloadButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabReloadButtonIsDisabled(tabRow);
    }

    async assertTabReloadButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabReloadButtonIsNotDisabled(tabRow);
    }

    async assertTabDuplicateButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabDuplicateButtonIsVisible(tabRow);
    }

    async assertTabDuplicateButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabDuplicateButtonIsDisabled(tabRow);
    }

    async assertTabDuplicateButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabDuplicateButtonIsNotDisabled(tabRow);
    }

    async assertTabCloseButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabCloseButtonIsVisible(tabRow);
    }

    async assertTabCloseButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabCloseButtonIsNotVisible(tabRow);
    }

    async assertTabLastAccessDateIsRoughlyEqualToDate(tabRow: WebElement, date: Date) {
        return this.tabsTestHelper.assertTabLastAccessDateIsRoughlyEqualToDate(tabRow, date);
    }

    async assertTabLastAccessDateIsEqualToString(tabRow: WebElement, text: string) {
        return this.tabsTestHelper.assertTabLastAccessDateIsEqualToString(tabRow, text);
    }

    async assertNoTooltipVisible() {
        const containerElement = await this.driver.findElement(By.css('#followedTabList'));
        await this.tabsTestHelper.assertNoTooltipVisible(containerElement);
    }
}
