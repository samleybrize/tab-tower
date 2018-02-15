import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';
import { TabsTestHelper } from './tabs-test-helper';

export class OpenedTabsTestHelper {
    constructor(private tabsTestHelper: TabsTestHelper, private driver: WebDriver, private browserInstructionSender: BrowserInstructionSender) {
    }

    async getTabRowList() {
        return this.driver.findElements(By.css('#openedTabList tbody tr[data-tab-id]'));
    }

    async getTabRowByTabIndex(tabIndex: number) {
        const rowList = await this.driver.findElements(By.css(`#openedTabList tbody tr[data-index="${tabIndex}"]`));

        return rowList.length ? rowList[0] : null;
    }

    getNoTabRow() {
        return this.driver.findElement(By.css('#openedTabList tbody .noTabRow'));
    }

    async clickOnTabMoreButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
    }

    async clickOnTabCloseButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await tabRow.findElement(By.css('.closeButton')).click();
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

    async clickOnTabTitle(tabRow: WebElement) {
        const tabIndex = +await tabRow.getAttribute('data-index');

        await tabRow.findElement(By.css('.title a')).click();
        await this.driver.wait(async () => {
            return tabIndex === (await this.browserInstructionSender.getActiveTab()).index;
        }, 10000);
    }

    async clickOnTabFollowButton(tabRow: WebElement, w?: boolean) {
        const followButton = this.getFollowButton(tabRow);

        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await followButton.click();

        if (false !== w) {
            await this.driver.wait(async () => {
                return !await followButton.isDisplayed();
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnTabUnfollowButton(tabRow: WebElement) {
        const unfollowButton = this.getUnfollowButton(tabRow);

        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await unfollowButton.click();
        await this.driver.wait(async () => {
            return !await unfollowButton.isDisplayed();
        }, 3000);
    }

    async clickOnTabPinButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabPinButton(tabRow, true);
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

    async showTitleTooltip(tabRow: WebElement) {
        const tabId = await tabRow.getAttribute('data-tab-id');
        await this.tabsTestHelper.showElementTooltip(`#openedTabList tbody tr[data-tab-id="${tabId}"] .title a`);
    }

    async getNumberOfTabsWithUrl(url?: string) {
        if ('string' != typeof url || '' == url) {
            url = 'about:newtab';
        }

        const titleElementList = await this.driver.findElements(By.css('#openedTabList tbody tr[data-tab-id] .title a'));

        return this.tabsTestHelper.getNumberOfTabsWithUrl(titleElementList, url);
    }

    getTabTitle(tabRow: WebElement) {
        return this.tabsTestHelper.getTabTitle(tabRow);
    }

    getTabUrl(tabRow: WebElement) {
        return this.tabsTestHelper.getTabUrl(tabRow);
    }

    getTabFaviconUrl(tabRow: WebElement) {
        return this.tabsTestHelper.getTabFaviconUrl(tabRow);
    }

    getCloseButton(tabRow: WebElement) {
        return this.tabsTestHelper.getCloseButton(tabRow);
    }

    getFollowButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.followButton'));
    }

    getUnfollowButton(tabRow: WebElement) {
        return this.tabsTestHelper.getUnfollowButton(tabRow);
    }

    async changeTabLastAccessText(tabRow: WebElement, newText: string) {
        const tabId = await tabRow.getAttribute('data-tab-id');
        await this.driver.executeScript(`
            const element = document.querySelector('#openedTabList tbody tr[data-tab-id="${tabId}"] .lastAccess');

            if (element) {
                element.innerText = '${newText}';
            }
        `);
    }

    async assertNumberOfTabs(expectedNumberOfTabs: number) {
        const openedTabRowList = await this.getTabRowList();
        await this.tabsTestHelper.assertNumberOfTabs(openedTabRowList, expectedNumberOfTabs);
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

    async assertTabCloseButtonIsVisible(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabCloseButtonIsVisible(tabRow);
    }

    async assertTabCloseButtonIsDisabled(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabCloseButtonIsDisabled(tabRow);
    }

    async assertTabFollowButtonIsVisible(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        const isFollowButtonDisplayed = await this.getFollowButton(tabRow).isDisplayed();
        assert.isTrue(isFollowButtonDisplayed, 'Tab follow button is not visible');
    }

    async assertTabFollowButtonIsNotVisible(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        const isFollowButtonDisplayed = await this.getFollowButton(tabRow).isDisplayed();
        assert.isFalse(isFollowButtonDisplayed, 'Tab follow button is visible');
    }

    async assertTabUnfollowButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnfollowButtonIsVisible(tabRow);
    }

    async assertTabUnfollowButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabUnfollowButtonIsNotVisible(tabRow);
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

    async assertTabReloadButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabReloadButtonIsVisible(tabRow);
    }

    async assertTabReloadButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabReloadButtonIsDisabled(tabRow);
    }

    async assertTabReloadButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabReloadButtonIsNotDisabled(tabRow);
    }

    async assertTabFollowButtonIsDisabled(tabRow: WebElement) {
        const followButton = await this.getFollowButton(tabRow);
        const followButtonClasses = ('' + await followButton.getAttribute('class')).split(' ');

        assert.include(followButtonClasses, 'disabled');
    }

    async assertTabFollowButtonIsNotDisabled(tabRow: WebElement) {
        const followButton = await this.getFollowButton(tabRow);
        const followButtonClasses = ('' + await followButton.getAttribute('class')).split(' ');

        assert.notInclude(followButtonClasses, 'disabled');
    }

    async assertTabLastAccessDateIsRoughlyEqualToDate(tabRow: WebElement, date: Date) {
        return this.tabsTestHelper.assertTabLastAccessDateIsRoughlyEqualToDate(tabRow, date);
    }

    async assertTabLastAccessDateIsEqualToString(tabRow: WebElement, text: string) {
        return this.tabsTestHelper.assertTabLastAccessDateIsEqualToString(tabRow, text);
    }
}
