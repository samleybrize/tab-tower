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

    // TODO
    async clickOnTabTitle(tabRow: WebElement) {
        const isOpenedTab = null !== await tabRow.getAttribute('data-tab-id');
        const isFollowedTab = null !== await tabRow.getAttribute('data-follow-id');
        let followedOpenIndicator: WebElement = null;
        let tabIndex: number = null;
        let numberOfMatchingTabsBefore: number;
        let url: string;

        if (isFollowedTab) {
            tabIndex = +await tabRow.getAttribute('data-opened-index');
            followedOpenIndicator = tabRow.findElement(By.css('.openIndicator .on'));

            if (null === tabIndex) {
                url = await tabRow.findElement(By.css('.title a')).getAttribute('data-url');
                numberOfMatchingTabsBefore = await this.getNumberOfTabsWithUrl(url);
            }
        } else {
            tabIndex = +await tabRow.getAttribute('data-index');
        }

        await tabRow.findElement(By.css('.title a')).click();
        await this.driver.wait(async () => {
            if (isOpenedTab) {
                return tabIndex === (await this.browserInstructionSender.getActiveTab()).index;
            } else if (isFollowedTab && null !== tabIndex) {
                return tabIndex === (await this.browserInstructionSender.getActiveTab()).id;
            } else if (isFollowedTab) {
                const numberOfMatchingTabs = await this.getNumberOfTabsWithUrl(url);

                if (numberOfMatchingTabs > numberOfMatchingTabsBefore) {
                    return true;
                }
            }
        }, 10000);
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
}
