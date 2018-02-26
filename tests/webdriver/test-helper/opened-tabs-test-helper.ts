import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';
import { TabsTestHelper } from './tabs-test-helper';

export class OpenedTabsTestHelper {
    constructor(private tabsTestHelper: TabsTestHelper, private driver: WebDriver, private browserInstructionSender: BrowserInstructionSender) {
    }

    getContainerElement() {
        return this.driver.findElement(By.css('#openedTabList'));
    }

    getHeaderRow() {
        return this.getContainerElement().findElement(By.css('thead tr'));
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

    async clickOnTabMoreButton(tabRow: WebElement, waitFullyVisible?: boolean) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow, !!waitFullyVisible);
    }

    async clickOnSelectionTabMoreButton(waitFullyVisible?: boolean) {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnTabMoreButton(headerRow, !!waitFullyVisible);
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

    async clickOnSelectionTabCloseButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabCloseButton(headerRow);
    }

    async clickOnTabTitle(tabRow: WebElement) {
        const tabIndex = +await tabRow.getAttribute('data-index');

        await tabRow.findElement(By.css('.title')).click();
        await this.driver.wait(async () => {
            return tabIndex === (await this.browserInstructionSender.getActiveTab()).index;
        }, 10000);
    }

    async clickOnTabFollowButton(tabRow: WebElement, waitButtonVisibilityChange?: boolean) {
        const followButton = this.getFollowButton(tabRow);

        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await followButton.click();

        if (false !== waitButtonVisibilityChange) {
            await this.driver.wait(async () => {
                return !await followButton.isDisplayed();
            }, 3000);
        } else {
            await sleep(500);
        }
    }

    async clickOnSelectionTabFollowButton() {
        const headerRow = this.getHeaderRow();
        const followButton = this.getFollowButton(headerRow);

        await this.tabsTestHelper.clickOnTabMoreButton(headerRow);
        await followButton.click();

        await sleep(500);
    }

    async clickOnTabUnfollowButton(tabRow: WebElement) {
        const unfollowButton = this.getUnfollowButton(tabRow);

        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await unfollowButton.click();
        await this.driver.wait(async () => {
            return !await unfollowButton.isDisplayed();
        }, 3000);
    }

    async clickOnSelectionTabUnfollowButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabUnfollowButton(headerRow);
    }

    async clickOnTabPinButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabPinButton(tabRow, true);
    }

    async clickOnSelectionTabPinButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabPinButton(headerRow);
    }

    async clickOnTabUnpinButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabUnpinButton(tabRow);
    }

    async clickOnSelectionTabUnpinButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabUnpinButton(headerRow);
    }

    async clickOnTabMuteButton(tabRow: WebElement, waitMuteIndicatorStateChange?: boolean) {
        if (undefined === waitMuteIndicatorStateChange) {
            waitMuteIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnTabMuteButton(tabRow, waitMuteIndicatorStateChange);
    }

    async clickOnSelectionTabMuteButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabMuteButton(headerRow);
    }

    async clickOnTabUnmuteButton(tabRow: WebElement, waitMuteIndicatorStateChange?: boolean) {
        if (undefined === waitMuteIndicatorStateChange) {
            waitMuteIndicatorStateChange = true;
        }

        await this.tabsTestHelper.clickOnTabUnmuteButton(tabRow, waitMuteIndicatorStateChange);
    }

    async clickOnSelectionTabUnmuteButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabUnmuteButton(headerRow);
    }

    async clickOnTabReloadButton(tabIndex: number, tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabReloadButton(tabIndex, tabRow);
    }

    async clickOnSelectionTabReloadButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabReloadButton(headerRow);
    }

    async clickOnTabDuplicateButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabDuplicateButton(tabRow, true);
    }

    async clickOnSelectionTabDuplicateButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabDuplicateButton(headerRow);
    }

    async clickOnTabMoveButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoveButton(tabRow);
    }

    async clickOnSelectionTabMoveButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnSelectionTabMoveButton(headerRow);
    }

    async clickOnTabMoveBelowButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoveBelowButton(tabRow);
    }

    async clickOnMoveAboveOthersButton() {
        await this.tabsTestHelper.clickOnMoveAboveOthersButton(this.getContainerElement());
    }

    async clickOnTabMoveCancelButton() {
        await this.tabsTestHelper.clickOnTabMoveCancelButton(this.getContainerElement());
    }

    async clickOnTabSelector(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabSelector(tabRow);
    }

    async shiftClickOnTabSelector(tabRow: WebElement) {
        const id = await tabRow.getAttribute('data-tab-id');
        this.browserInstructionSender.triggerShiftClick(this.driver, `#openedTabList tbody tr[data-tab-id="${id}"] .tabSelector label`);
        await sleep(300);
    }

    async clickOnGeneralTabSelector() {
        await this.tabsTestHelper.clickOnGeneralTabSelector(this.getContainerElement());
    }

    async showTitleTooltip(tabRow: WebElement) {
        const tabId = await tabRow.getAttribute('data-tab-id');
        await this.tabsTestHelper.showElementTooltip(`#openedTabList tbody tr[data-tab-id="${tabId}"] .title`);
    }

    async getNumberOfTabsWithUrl(url?: string) {
        if ('string' != typeof url || '' == url) {
            url = 'about:newtab';
        }

        const titleElementList = await this.driver.findElements(By.css('#openedTabList tbody tr[data-tab-id] .title'));

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

    getFollowIndicator(tabRow: WebElement) {
        return tabRow.findElement(By.css('.followedIndicator'));
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

    async waitThatFollowIndicatorIsFullyOn(tabRow: WebElement) {
        const indicator = this.getFollowIndicator(tabRow);
        await this.tabsTestHelper.waitThatOnOffIndicatorIsFullyOn(indicator);
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

    async assertNoTabIndicatorIsVisible() {
        await this.tabsTestHelper.assertNoTabIndicatorIsVisible(this.getContainerElement());
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

    async assertTabFollowIndicatorIsOn(tabRow: WebElement) {
        const followIndicator = this.getFollowIndicator(tabRow);
        await this.tabsTestHelper.assertIndicatorIsOn(followIndicator, 'Tab follow');
    }

    async assertTabFollowIndicatorIsOff(tabRow: WebElement) {
        const followIndicator = this.getFollowIndicator(tabRow);
        await this.tabsTestHelper.assertIndicatorIsOff(followIndicator, 'Tab follow');
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

    async assertTabDuplicateButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabDuplicateButtonIsVisible(tabRow);
    }

    async assertTabDuplicateButtonIsDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabDuplicateButtonIsDisabled(tabRow);
    }

    async assertTabDuplicateButtonIsNotDisabled(tabRow: WebElement) {
        return this.tabsTestHelper.assertTabDuplicateButtonIsNotDisabled(tabRow);
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

    async assertNoTooltipVisible() {
        const containerElement = await this.driver.findElement(By.css('#openedTabList'));
        await this.tabsTestHelper.assertNoTooltipVisible(containerElement);
    }

    async assertNoTabSelectorIsVisible() {
        await this.tabsTestHelper.assertNoTabSelectorIsVisible(this.getContainerElement());
    }

    async assertTabSelectorIsChecked(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabSelectorIsChecked(tabRow);
    }

    async assertTabSelectorIsNotChecked(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabSelectorIsNotChecked(tabRow);
    }

    async assertGeneralTabSelectorIsChecked() {
        await this.tabsTestHelper.assertGeneralTabSelectorIsChecked(this.getContainerElement());
    }

    async assertGeneralTabSelectorIsNotChecked() {
        await this.tabsTestHelper.assertGeneralTabSelectorIsNotChecked(this.getContainerElement());
    }

    async assertNoTabMoreButtonIsVisible() {
        await this.tabsTestHelper.assertNoTabMoreButtonIsVisible(this.getContainerElement());
    }

    async assertSelectionTabMoreButtonIsVisible() {
        await sleep(300);
        await this.tabsTestHelper.assertSelectionTabMoreButtonIsVisible(this.getContainerElement());
    }

    async assertSelectionTabMoreButtonIsNotVisible() {
        await sleep(300);
        await this.tabsTestHelper.assertSelectionTabMoreButtonIsNotVisible(this.getContainerElement());
    }

    async assertTabMoveBelowButtonIsVisible(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabMoveBelowButtonIsVisible(tabRow);
    }

    async assertMoveAboveOthersButtonIsVisible() {
        await this.tabsTestHelper.assertMoveAboveOthersButtonIsVisible(this.getContainerElement());
    }

    async assertTabIsBeingMoved(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabIsBeingMoved(tabRow);
    }

    async assertTabIsNotBeingMoved(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabIsNotBeingMoved(tabRow);
    }
}
