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

    async clickOnTabCloseButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnMoreButton(tabRow);
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

    async clickOnFollowButton(tabRow: WebElement, w?: boolean) {
        const followButton = this.getFollowButton(tabRow);

        await this.tabsTestHelper.clickOnMoreButton(tabRow);
        await followButton.click();

        if (false !== w) {
            await this.driver.wait(async () => {
                return !await followButton.isDisplayed();
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnUnfollowButton(tabRow: WebElement) {
        const unfollowButton = this.getUnfollowButton(tabRow);

        await this.tabsTestHelper.clickOnMoreButton(tabRow);
        await unfollowButton.click();
        await this.driver.wait(async () => {
            return !await unfollowButton.isDisplayed();
        }, 3000);
    }

    async clickOnPinButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnPinButton(tabRow, true);
    }

    async clickOnUnpinButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnUnpinButton(tabRow);
    }

    async clickOnMuteButton(tabRow: WebElement, waitMuteIndicatorStateChange?: boolean) {
        if (undefined === waitMuteIndicatorStateChange) {
            waitMuteIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnMuteButton(tabRow, waitMuteIndicatorStateChange);
    }

    async clickOnUnmuteButton(tabRow: WebElement, waitMuteIndicatorStateChange?: boolean) {
        if (undefined === waitMuteIndicatorStateChange) {
            waitMuteIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnUnmuteButton(tabRow, waitMuteIndicatorStateChange);
    }

    async clickOnReloadButton(tabIndex: number, tabRow: WebElement) {
        await this.tabsTestHelper.clickOnReloadButton(tabIndex, tabRow);
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

    async assertCloseButtonIsVisible(tabRow: WebElement) {
        await this.tabsTestHelper.assertCloseButtonIsVisible(tabRow);
    }

    async assertCloseButtonIsDisabled(tabRow: WebElement) {
        await this.tabsTestHelper.assertCloseButtonIsDisabled(tabRow);
    }

    async assertFollowButtonIsVisible(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnMoreButton(tabRow);
        const isFollowButtonDisplayed = await this.getFollowButton(tabRow).isDisplayed();
        assert.isTrue(isFollowButtonDisplayed, 'Tab follow button is not visible');
    }

    async assertFollowButtonIsNotVisible(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnMoreButton(tabRow);
        const isFollowButtonDisplayed = await this.getFollowButton(tabRow).isDisplayed();
        assert.isFalse(isFollowButtonDisplayed, 'Tab follow button is visible');
    }

    async assertUnfollowButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnfollowButtonIsVisible(tabRow);
    }

    async assertUnfollowButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnfollowButtonIsNotVisible(tabRow);
    }

    async assertPinButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertPinButtonIsVisible(tabRow);
    }

    async assertPinButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertPinButtonIsNotVisible(tabRow);
    }

    async assertPinButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertPinButtonIsDisabled(tabRow);
    }

    async assertPinButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertPinButtonIsNotDisabled(tabRow);
    }

    async assertUnpinButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnpinButtonIsVisible(tabRow);
    }

    async assertUnpinButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnpinButtonIsNotVisible(tabRow);
    }

    async assertMuteButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertMuteButtonIsVisible(tabRow);
    }

    async assertMuteButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertMuteButtonIsNotVisible(tabRow);
    }

    async assertMuteButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertMuteButtonIsDisabled(tabRow);
    }

    async assertMuteButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertMuteButtonIsNotDisabled(tabRow);
    }

    async assertUnmuteButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnmuteButtonIsVisible(tabRow);
    }

    async assertUnmuteButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnmuteButtonIsNotVisible(tabRow);
    }

    async assertReloadButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertReloadButtonIsVisible(tabRow);
    }

    async assertReloadButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertReloadButtonIsDisabled(tabRow);
    }

    async assertReloadButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertReloadButtonIsNotDisabled(tabRow);
    }

    async assertFollowButtonIsDisabled(tabRow: WebElement) {
        const followButton = await this.getFollowButton(tabRow);
        const followButtonClasses = ('' + await followButton.getAttribute('class')).split(' ');

        assert.include(followButtonClasses, 'disabled');
    }

    async assertFollowButtonIsNotDisabled(tabRow: WebElement) {
        const followButton = await this.getFollowButton(tabRow);
        const followButtonClasses = ('' + await followButton.getAttribute('class')).split(' ');

        assert.notInclude(followButtonClasses, 'disabled');
    }

    async assertLastAccessDateIsRoughlyEqualToDate(tabRow: WebElement, date: Date) {
        return this.tabsTestHelper.assertLastAccessDateIsRoughlyEqualToDate(tabRow, date);
    }

    async assertLastAccessDateIsEqualToString(tabRow: WebElement, text: string) {
        return this.tabsTestHelper.assertLastAccessDateIsEqualToString(tabRow, text);
    }
}
