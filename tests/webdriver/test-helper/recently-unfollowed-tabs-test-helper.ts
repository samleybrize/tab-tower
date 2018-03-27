import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';
import { TabsTestHelper } from './tabs-test-helper';

export class RecentlyUnfollowedTabsTestHelper {
    constructor(private tabsTestHelper: TabsTestHelper, private driver: WebDriver, private browserInstructionSender: BrowserInstructionSender) {
    }

    getContainerElement() {
        return this.driver.findElement(By.css('#recentlyUnfollowedTabList'));
    }

    getHeaderRow() {
        return this.getContainerElement().findElement(By.css('thead tr'));
    }

    async getTabRowList() {
        return this.driver.findElements(By.css('#recentlyUnfollowedTabList tbody tr[data-follow-id]'));
    }

    getNoTabRow() {
        return this.driver.findElement(By.css('#recentlyUnfollowedTabList tbody .noTabRow'));
    }

    async hideMoreDropdown(tabRow: WebElement) {
        await this.tabsTestHelper.hideMoreDropdown(tabRow);
    }

    async clickOnTabMoreButton(tabRow: WebElement, waitFullyVisible?: boolean) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow, !!waitFullyVisible);
    }

    async clickOnSelectionTabMoreButton(waitFullyVisible?: boolean) {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnTabMoreButton(headerRow, !!waitFullyVisible);
    }

    async clickOnTabDeleteButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await tabRow.findElement(By.css('.deleteRecentlyUnfollowedTabButton')).click();
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

    async clickOnSelectionTabDeleteButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnTabMoreButton(headerRow);
        await headerRow.findElement(By.css('.deleteRecentlyUnfollowedTabButton')).click();

        await sleep(500);
    }

    async clickOnTabRestoreButton(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabMoreButton(tabRow);
        await tabRow.findElement(By.css('.restoreRecentlyUnfollowedTabButton')).click();
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

    async clickOnSelectionTabRestoreButton() {
        const headerRow = this.getHeaderRow();
        await this.tabsTestHelper.clickOnTabMoreButton(headerRow);
        await headerRow.findElement(By.css('.restoreRecentlyUnfollowedTabButton')).click();

        await sleep(500);
    }

    async clickOnTabSelector(tabRow: WebElement) {
        await this.tabsTestHelper.clickOnTabSelector(tabRow);
    }

    async shiftClickOnTabSelector(tabRow: WebElement) {
        const id = await tabRow.getAttribute('data-follow-id');
        this.browserInstructionSender.triggerShiftClick(this.driver, `#recentlyUnfollowedTabList tbody tr[data-follow-id="${id}"] .tabSelector label`);
        await sleep(300);
    }

    async clickOnGeneralTabSelector() {
        await this.tabsTestHelper.clickOnGeneralTabSelector(this.getContainerElement());
    }

    async getNumberOfTabsWithUrl(url?: string) {
        const titleElementList = await this.driver.findElements(By.css('#recentlyUnfollowedTabList tbody tr[data-follow-id] .title'));

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

    async waitThatSelectionTabMoreButtonIsFullyHidden() {
        await this.tabsTestHelper.waitThatSelectionTabMoreButtonIsFullyHidden(this.getContainerElement());
    }

    async changeTabLastAccessText(tabRow: WebElement, newText: string) {
        const followId = await tabRow.getAttribute('data-follow-id');
        await this.driver.executeScript(`
            const element = document.querySelector('#recentlyUnfollowedTabList tbody tr[data-follow-id="${followId}"] .lastAccess');

            if (element) {
                element.innerText = '${newText}';
            }
        `);
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

    async assertTabLastAccessDateIsRoughlyEqualToDate(tabRow: WebElement, date: Date) {
        return this.tabsTestHelper.assertTabLastAccessDateIsRoughlyEqualToDate(tabRow, date);
    }

    async assertTabLastAccessDateIsEqualToString(tabRow: WebElement, text: string) {
        return this.tabsTestHelper.assertTabLastAccessDateIsEqualToString(tabRow, text);
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
        await this.tabsTestHelper.assertSelectionTabMoreButtonIsVisible(this.getContainerElement());
    }

    async assertSelectionTabMoreButtonIsNotVisible() {
        await this.tabsTestHelper.assertSelectionTabMoreButtonIsNotVisible(this.getContainerElement());
    }
}
