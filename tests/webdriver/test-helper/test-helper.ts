import { By, error as WebDriverError, until, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { TestsConfig } from '../../tests-config';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';
import { ExtensionUrl } from '../../utils/extension-url';
import { FirefoxConfig } from '../firefox-config';
import { ScreenshotTaker } from '../screenshot-taker';
import { WebDriverRetriever } from '../webdriver-retriever';
import { FollowedTabsTestHelper } from './followed-tabs-test-helper';
import { NavigationTestHelper } from './navigation-test-helper';
import { OpenedTabsTestHelper } from './opened-tabs-test-helper';
import { TabFilterTestHelper } from './tab-filter-test-helper';
import { TabsTestHelper } from './tabs-test-helper';

export class TestHelper {
    private testsConfig: TestsConfig;
    private browserInstructionSender: BrowserInstructionSender;
    private driver: WebDriver;
    private firefoxConfig: FirefoxConfig;
    private webdriverRetriever: WebDriverRetriever;
    private openedTabsTestHelper: OpenedTabsTestHelper;
    private followedTabsTestHelper: FollowedTabsTestHelper;
    private navigationTestHelper: NavigationTestHelper;
    private screenshotTaker: ScreenshotTaker;
    private tabFilterTestHelper: TabFilterTestHelper;

    constructor() {
        this.testsConfig = TestsConfig.getInstance();
        this.browserInstructionSender = BrowserInstructionSender.getInstance();
        this.screenshotTaker = ScreenshotTaker.getInstance();
        this.webdriverRetriever = WebDriverRetriever.getInstance();
        this.driver = this.webdriverRetriever.getDriver();
        this.firefoxConfig = this.webdriverRetriever.getFirefoxConfig();

        this.browserInstructionSender.init();

        const tabsTestHelper = new TabsTestHelper(this.driver, this.browserInstructionSender);
        this.openedTabsTestHelper = new OpenedTabsTestHelper(tabsTestHelper, this.driver, this.browserInstructionSender);
        this.followedTabsTestHelper = new FollowedTabsTestHelper(tabsTestHelper, this.driver, this.browserInstructionSender);
        this.navigationTestHelper = new NavigationTestHelper(this.driver, this.screenshotTaker);
        this.tabFilterTestHelper = new TabFilterTestHelper(this.driver, this.browserInstructionSender, this.screenshotTaker);
    }

    async shutdown() {
        if (!this.testsConfig.keepBrowserOpened) {
            await this.driver.quit();
        }

        await this.browserInstructionSender.shutdown();
    }

    getBrowserInstructionSender() {
        return this.browserInstructionSender;
    }

    getDriver() {
        return this.driver;
    }

    getFirefoxConfig() {
        return this.firefoxConfig;
    }

    getOpenedTabsHelper() {
        return this.openedTabsTestHelper;
    }

    getFollowedTabsHelper() {
        return this.followedTabsTestHelper;
    }

    getNavigationHelper() {
        return this.navigationTestHelper;
    }

    getTabFilterHelper() {
        return this.tabFilterTestHelper;
    }

    async resetBrowserState() {
        await this.browserInstructionSender.resetBrowserState();
        await this.reloadExtension();
        await this.changeTabUrl(0, this.firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
        await this.switchToWindowHandle(0);
    }

    async switchToWindowHandle(windowIndex: number) {
        const windowHandles = await this.driver.getAllWindowHandles();
        await this.driver.switchTo().window(windowHandles[windowIndex]);
    }

    async reloadExtension() {
        await this.browserInstructionSender.reloadExtension();
        await sleep(1000);
    }

    async reloadTab(tabIndex: number) {
        await this.browserInstructionSender.reloadTab(tabIndex);
        await sleep(100);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(tabIndex);

            if (tab && 'complete' == tab.status) {
                return true;
            }
        }, 3000);
        await sleep(500);
    }

    async createWindow(isIncognito: boolean, url: string) {
        await this.browserInstructionSender.createWindow(true, url);
        await sleep(1000);
    }

    async openTab(url?: string, index?: number) {
        const numberOfMatchingTabsBefore = await this.openedTabsTestHelper.getNumberOfTabsWithUrl(url);
        await this.browserInstructionSender.openTab(url, index);
        await this.driver.wait(async () => {
            const numberOfMatchingTabs = await this.openedTabsTestHelper.getNumberOfTabsWithUrl(url);

            if (numberOfMatchingTabs > numberOfMatchingTabsBefore) {
                return true;
            }
        }, 10000);
    }

    async openIgnoredTab(url: string, index: number) {
        await this.browserInstructionSender.openTab(url, index);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(index);

            if (tab && 'complete' == tab.status) {
                return true;
            }
        }, 3000);
    }

    async duplicateTab(index: number) {
        const activeTab = await this.browserInstructionSender.getActiveTab();
        const newTabId = await this.browserInstructionSender.duplicateTab(index);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(newTabId.index);

            if (tab && 'complete' == tab.status) {
                return true;
            }
        }, 10000);
        await this.focusTab(activeTab.index);
    }

    async closeTab(tabIndex: number) {
        const openedTabRow = await this.openedTabsTestHelper.getTabRowByTabIndex(tabIndex);
        const openedTabId = openedTabRow ? +await openedTabRow.getAttribute('data-tab-id') : null;
        const followedTabRow = openedTabId ? await this.followedTabsTestHelper.getTabRowByOpenedTabId(openedTabId) : null;
        const isRowFound = !!openedTabRow;

        await this.browserInstructionSender.closeTab(tabIndex);

        if (isRowFound) {
            await this.driver.wait(async () => {
                try {
                    await openedTabRow.isDisplayed();
                } catch (error) {
                    if (error instanceof WebDriverError.StaleElementReferenceError) {
                        return true;
                    }
                }
            }, 3000);

            if (followedTabRow) {
                await this.waitFollowedOpenIndicatorOff(followedTabRow);
            }
        } else {
            await sleep(500);
            return true;
        }
    }

    private async waitFollowedOpenIndicatorOff(followedTabRow: WebElement) {
        const followedOpenIndicator = this.followedTabsTestHelper.getOpenIndicator(followedTabRow);

        return this.driver.wait(async () => {
            const isOnDisplayed = await followedOpenIndicator.on.isDisplayed();

            return !isOnDisplayed;
        }, 3000);
    }

    async focusTab(tabIndex: number) {
        await this.browserInstructionSender.focusTab(tabIndex);
    }

    async moveTab(fromIndex: number, toIndex: number) {
        await this.browserInstructionSender.moveTab(fromIndex, toIndex);
        await sleep(500);
    }

    async changeTabUrl(tabIndex: number, newUrl: string) {
        await this.browserInstructionSender.changeTabUrl(tabIndex, newUrl);

        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(tabIndex);

            return 'complete' == tab.status && tab.url == newUrl;
        }, 10000);
        await sleep(500);
    }

    async makeTabGoToPreviousPage(tabIndex: number) {
        await this.browserInstructionSender.makeTabGoToPreviousPage(tabIndex);
        await sleep(100);

        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(tabIndex);

            return 'complete' == tab.status;
        }, 10000);
        await sleep(500);
    }

    async enableTabReaderMode(tabIndex: number, row?: WebElement) {
        const isOn = await row.findElement(By.css('.readerModeIndicator .on')).isDisplayed();

        if (null == row || isOn) {
            return;
        }

        await this.browserInstructionSender.toggleReaderMode(tabIndex);
        await this.driver.wait(async () => {
            const isOnIndicatorVisible = await row.findElement(By.css('.readerModeIndicator .on')).isDisplayed();
            const isOffIndicatorVisible = await row.findElement(By.css('.readerModeIndicator .off')).isDisplayed();

            return isOnIndicatorVisible && !isOffIndicatorVisible;
        }, 10000);
    }

    async disableTabReaderMode(tabIndex: number, row?: WebElement) {
        const isOff = await row.findElement(By.css('.readerModeIndicator .off')).isDisplayed();

        if (null == row || isOff) {
            return;
        }

        await this.browserInstructionSender.toggleReaderMode(tabIndex);
        await this.driver.wait(async () => {
            const isOnIndicatorVisible = await row.findElement(By.css('.readerModeIndicator .on')).isDisplayed();
            const isOffIndicatorVisible = await row.findElement(By.css('.readerModeIndicator .off')).isDisplayed();

            return !isOnIndicatorVisible && isOffIndicatorVisible;
        }, 10000);
    }

    async clearRecentlyClosedTabs() {
        await this.browserInstructionSender.clearRecentlyClosedTabs();
    }

    async restoreRecentlyClosedTab(index: number) {
        const restoredTabIndex = await this.browserInstructionSender.restoreRecentlyClosedTab(index);

        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTab(restoredTabIndex);

            return 'complete' == tab.status;
        }, 10000);
        await sleep(1500);
    }

    async takeViewportScreenshot(screenshotIdentifier: string) {
        await this.screenshotTaker.takeViewport(screenshotIdentifier, this.driver);
    }

    async showOpenedTabsList() {
        const openedTabListElement = this.driver.findElement(By.css('#openedTabList'));
        await this.driver.findElement(By.css('#header .openedTabs')).click();
        await this.driver.wait(until.elementIsVisible(openedTabListElement), 3000);
    }

    async showFollowedTabsList() {
        const followedTabListElement = this.driver.findElement(By.css('#followedTabList'));
        await this.driver.findElement(By.css('#header .followedTabs')).click();
        await this.driver.wait(until.elementIsVisible(followedTabListElement), 3000);
    }
}
