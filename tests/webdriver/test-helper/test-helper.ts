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
    private tabsTestHelper: TabsTestHelper;
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

        this.tabsTestHelper = new TabsTestHelper(this.driver, this.browserInstructionSender);
        this.openedTabsTestHelper = new OpenedTabsTestHelper(this.tabsTestHelper, this.driver, this.browserInstructionSender);
        this.followedTabsTestHelper = new FollowedTabsTestHelper(this.tabsTestHelper, this.driver, this.browserInstructionSender);
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
        await this.changeTabUrl(0, this.firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));
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
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

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
            const tab = await this.browserInstructionSender.getTabByIndex(index);

            if (tab && 'complete' == tab.status) {
                return true;
            }
        }, 3000);
    }

    async duplicateTab(index: number) {
        let activeTab = await this.browserInstructionSender.getActiveTab();
        const newTabId = await this.browserInstructionSender.duplicateTab(index);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabById(newTabId.id);

            return tab && 'complete' == tab.status;
        }, 10000);

        activeTab = await this.browserInstructionSender.getTabById(activeTab.id);
        await this.focusTab(activeTab.index);
        await sleep(300);
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
            return await this.tabsTestHelper.hasClass(followedOpenIndicator, 'off');
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
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return 'complete' == tab.status && tab.url == newUrl;
        }, 10000);
        await sleep(500);
    }

    async makeTabGoToPreviousPage(tabIndex: number) {
        await this.browserInstructionSender.makeTabGoToPreviousPage(tabIndex);
        await sleep(100);

        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return 'complete' == tab.status;
        }, 10000);
        await sleep(500);
    }

    async enableTabReaderMode(tabIndex: number, row: WebElement) {
        const readerModeIndicator = await this.tabsTestHelper.getReaderModeIndicator(row);
        const isOn = await this.tabsTestHelper.hasClass(readerModeIndicator, 'on');

        if (isOn) {
            return;
        }

        await this.browserInstructionSender.toggleReaderMode(tabIndex);
        await this.driver.wait(async () => {
            return await this.tabsTestHelper.hasClass(readerModeIndicator, 'on');
        }, 10000);
        await sleep(300);
    }

    async pinTab(tabIndex: number, row: WebElement) {
        const pinIndicator = await this.tabsTestHelper.getPinIndicator(row);
        const isOn = await this.tabsTestHelper.hasClass(pinIndicator, 'on');

        if (null == row || isOn) {
            return;
        }

        await this.browserInstructionSender.pinTab(tabIndex);
        await this.driver.wait(async () => {
            return this.tabsTestHelper.hasClass(pinIndicator, 'on');
        }, 10000);
    }

    async unpinTab(tabIndex: number, row: WebElement) {
        const pinIndicator = await this.tabsTestHelper.getPinIndicator(row);
        const isOff = await this.tabsTestHelper.hasClass(pinIndicator, 'off');

        if (null == row || isOff) {
            return;
        }

        await this.browserInstructionSender.unpinTab(tabIndex);
        await this.driver.wait(async () => {
            return this.tabsTestHelper.hasClass(pinIndicator, 'off');
        }, 10000);
    }

    async disableTabReaderMode(tabIndex: number, row?: WebElement) {
        const readerModeIndicator = await this.tabsTestHelper.getReaderModeIndicator(row);
        const isOff = await this.tabsTestHelper.hasClass(readerModeIndicator, 'off');

        if (null == row || isOff) {
            return;
        }

        await this.browserInstructionSender.toggleReaderMode(tabIndex);
        await this.driver.wait(async () => {
            return await this.tabsTestHelper.hasClass(readerModeIndicator, 'off');
        }, 10000);
        await sleep(300);
    }

    async muteTab(tabIndex: number) {
        await this.browserInstructionSender.muteTab(tabIndex);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return tab.mutedInfo.muted;
        }, 10000);
        await sleep(300);
    }

    async unmuteTab(tabIndex: number) {
        await this.browserInstructionSender.unmuteTab(tabIndex);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return !tab.mutedInfo.muted;
        }, 10000);
        await sleep(300);
    }

    async clearRecentlyClosedTabs() {
        await this.browserInstructionSender.clearRecentlyClosedTabs();
    }

    async restoreRecentlyClosedTab(index: number) {
        const restoredTabIndex = await this.browserInstructionSender.restoreRecentlyClosedTab(index);

        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(restoredTabIndex);

            return 'complete' == tab.status;
        }, 10000);
        await sleep(1500);
    }

    async takeViewportScreenshot(screenshotIdentifier: string) {
        await this.screenshotTaker.takeViewport(screenshotIdentifier, this.driver);
    }

    async pauseAudioElement(tabIndex: number, quotelessCssSelector: string) {
        const currentActiveTab = await this.browserInstructionSender.getActiveTab();

        await this.switchToWindowHandle(1);
        await this.driver.executeScript(`document.querySelector('${quotelessCssSelector}').pause();`);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return !tab.audible;
        }, 10000);

        await this.switchToWindowHandle(currentActiveTab.index);
    }

    async playAudioElement(tabIndex: number, quotelessCssSelector: string) {
        const currentActiveTab = await this.browserInstructionSender.getActiveTab();

        await this.switchToWindowHandle(1);
        await this.driver.executeScript(`document.querySelector('${quotelessCssSelector}').play();`);
        await this.driver.wait(async () => {
            const tab = await this.browserInstructionSender.getTabByIndex(tabIndex);

            return tab.audible;
        }, 10000);

        await this.switchToWindowHandle(currentActiveTab.index);
    }

    async showOpenedTabsList(waitFullyVisible?: boolean) {
        const openedTabListElement = this.driver.findElement(By.css('#openedTabList'));
        await this.driver.findElement(By.css('#header .openedTabs')).click();
        await this.driver.wait(until.elementIsVisible(openedTabListElement), 3000);

        if (waitFullyVisible) {
            await sleep(500);
        }
    }

    async showFollowedTabsList(waitFullyVisible?: boolean) {
        const followedTabListElement = this.driver.findElement(By.css('#followedTabList'));
        await this.driver.findElement(By.css('#header .followedTabs')).click();
        await this.driver.wait(until.elementIsVisible(followedTabListElement), 3000);

        if (waitFullyVisible) {
            await sleep(500);
        }
    }
}
