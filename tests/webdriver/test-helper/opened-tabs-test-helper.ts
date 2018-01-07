import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../browser-instruction-sender';
import { WebDriverRetriever } from '../webdriver-retriever';
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

    async clickOnFollowButton(tabRow: WebElement) {
        const followButton = this.getFollowButton(tabRow);

        await followButton.click();
        await this.driver.wait(async () => {
            return !await followButton.isDisplayed();
        }, 3000);
    }

    async clickOnUnfollowButton(tabRow: WebElement) {
        const unfollowButton = this.getUnfollowButton(tabRow);
        const tabId = await tabRow.getAttribute('data-tab-id');

        await this.browserInstructionSender.triggerDoubleClick(
            this.driver,
            `#openedTabList tbody tr[data-tab-id="${tabId}"] .unfollowButton`,
        );
        await this.driver.wait(async () => {
            return !await unfollowButton.isDisplayed();
        }, 3000);
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

    getReaderModeIndicator(tabRow: WebElement) {
        return this.tabsTestHelper.getReaderModeIndicator(tabRow);
    }

    getFollowButton(tabRow: WebElement) {
        return tabRow.findElement(By.css('.followButton'));
    }

    getUnfollowButton(tabRow: WebElement) {
        return this.tabsTestHelper.getUnfollowButton(tabRow);
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

    async assertNoTabRowIsVisible() {
        const noTabRow = this.getNoTabRow();
        await this.tabsTestHelper.assertNoTabRowIsVisible(noTabRow);
    }

    async assertNoTabRowIsNotVisible() {
        const noTabRow = this.getNoTabRow();
        await this.tabsTestHelper.assertNoTabRowIsNotVisible(noTabRow);
    }

    async assertTabReaderModeIndicatorIsOn(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabReaderModeIndicatorIsOn(tabRow);
    }

    async assertTabReaderModeIndicatorIsOff(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabReaderModeIndicatorIsOff(tabRow);
    }

    async assertFollowButtonIsVisible(tabRow: WebElement) {
        const isFollowButtonDisplayed = await this.getFollowButton(tabRow).isDisplayed();
        assert.isTrue(isFollowButtonDisplayed);
    }

    async assertFollowButtonIsNotVisible(tabRow: WebElement) {
        const isFollowButtonDisplayed = await this.getFollowButton(tabRow).isDisplayed();
        assert.isFalse(isFollowButtonDisplayed);
    }

    async assertUnfollowButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnfollowButtonIsVisible(tabRow);
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
}
