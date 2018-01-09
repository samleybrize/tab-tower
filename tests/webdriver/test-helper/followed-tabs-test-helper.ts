import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../browser-instruction-sender';
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

    async clickOnTabCloseButton(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);

        await tabRow.findElement(By.css('.closeButton')).click();
        await this.driver.wait(async () => {
            const isOnDisplayed = await openIndicator.on.isDisplayed();

            return !isOnDisplayed;
        }, 3000);
    }

    async clickOnTabTitle(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);
        const tabId = await this.getWebElementAttribute(tabRow, 'data-opened-tab-id');
        let numberOfMatchingTabsBefore: number;
        let url: string;

        if (null === tabId) {
            url = await this.getWebElementAttribute(tabRow.findElement(By.css('.title a')), 'data-url');
            numberOfMatchingTabsBefore = await this.getNumberOfTabsWithUrl(url);
        }

        await tabRow.findElement(By.css('.title a')).click();
        await this.driver.wait(async () => {
            if (null !== tabId) {
                return +tabId === (await this.browserInstructionSender.getActiveTab()).id;
            } else {
                return !await openIndicator.off.isDisplayed();
            }
        }, 10000);
    }

    private async getWebElementAttribute(element: WebElement, attributeName: string) {
        let attributeValue = await element.getAttribute(attributeName);

        if ('null' == attributeValue) {
            attributeValue = null;
        }

        return attributeValue;
    }

    async clickOnUnfollowButton(tabRow: WebElement) {
        const followId = await this.getWebElementAttribute(tabRow, 'data-follow-id');

        await this.browserInstructionSender.triggerDoubleClick(
            this.driver,
            `#followedTabList tbody tr[data-follow-id="${followId}"] .unfollowButton`,
        );
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

    async getNumberOfTabsWithUrl(url?: string) {
        const titleElementList = await this.driver.findElements(By.css('#followedTabList tbody tr[data-follow-id] .title a'));

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

    getOpenIndicator(tabRow: WebElement) {
        return {
            on: tabRow.findElement(By.css('.openIndicator .on')),
            off: tabRow.findElement(By.css('.openIndicator .off')),
        };
    }

    getUnfollowButton(tabRow: WebElement) {
        return this.tabsTestHelper.getUnfollowButton(tabRow);
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

    async assertTabReaderModeIndicatorIsOn(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabReaderModeIndicatorIsOn(tabRow);
    }

    async assertTabReaderModeIndicatorIsOff(tabRow: WebElement) {
        await this.tabsTestHelper.assertTabReaderModeIndicatorIsOff(tabRow);
    }

    async assertReaderModeTestPageTitle(tabRow: WebElement) {
        const title = await tabRow.findElement(By.css('.title a')).getText();
        assert.match(title, /mozilla/i);
        assert.notMatch(title, /http/i);
    }

    async assertTabOpenIndicatorIsOn(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);
        await this.tabsTestHelper.assertIndicatorIsOn(openIndicator);
    }

    async assertTabOpenIndicatorIsOff(tabRow: WebElement) {
        const openIndicator = this.getOpenIndicator(tabRow);
        await this.tabsTestHelper.assertIndicatorIsOff(openIndicator);
    }

    async assertUnfollowButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertUnfollowButtonIsVisible(tabRow);
    }

    async assertCloseButtonIsVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertCloseButtonIsVisible(tabRow);
    }

    async assertCloseButtonIsNotVisible(tabRow: WebElement) {
        return this.tabsTestHelper.assertCloseButtonIsNotVisible(tabRow);
    }
}