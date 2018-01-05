import { By, error as WebDriverError, until, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../browser-instruction-sender';
import { FirefoxConfig } from '../firefox-config';
import { WebDriverRetriever } from '../webdriver-retriever';
import { OpenedTabsTestHelper } from './opened-tabs-test-helper';
import { TabsTestHelper } from './tabs-test-helper';

export class TestHelper {
    private browserInstructionSender: BrowserInstructionSender;
    private driver: WebDriver;
    private firefoxConfig: FirefoxConfig;
    private webdriverRetriever: WebDriverRetriever;
    private openedTabsTestHelper: OpenedTabsTestHelper;

    constructor() {
        this.browserInstructionSender = BrowserInstructionSender.getInstance();
        this.webdriverRetriever = WebDriverRetriever.getInstance();
        this.driver = this.webdriverRetriever.getDriver();
        this.firefoxConfig = this.webdriverRetriever.getFirefoxConfig();

        this.browserInstructionSender.init();

        const tabsTestHelper = new TabsTestHelper(this.driver, this.browserInstructionSender);
        this.openedTabsTestHelper = new OpenedTabsTestHelper(tabsTestHelper, this.driver, this.browserInstructionSender);
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

    async switchToWindowHandle(windowIndex: number) {
        const windowHandles = await this.driver.getAllWindowHandles();
        await this.driver.switchTo().window(windowHandles[windowIndex]);
    }

    async reloadExtension() {
        await this.browserInstructionSender.reloadExtension();
        await sleep(1000);
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

    async closeTab(tabIndex: number) {
        const row = await this.openedTabsTestHelper.getTabRowByTabIndex(tabIndex);
        const isRowFound = !!row;

        await this.browserInstructionSender.closeTab(tabIndex);
        if (isRowFound) {
            await this.driver.wait(async () => {
                return null === await this.openedTabsTestHelper.getTabRowByTabIndex(tabIndex);
            }, 3000);
        } else {
            await sleep(500);
            return true;
        }
    }

    async focusTab(tabIndex: number) {
        await this.browserInstructionSender.focusTab(0);
    }

    async moveTab(fromIndex: number, toIndex: number) {
        const row = await this.openedTabsTestHelper.getTabRowByTabIndex(fromIndex);
        const isRowFound = !!row;

        await this.browserInstructionSender.moveTab(fromIndex, toIndex);
        if (isRowFound) {
            await this.driver.wait(async () => {
                return toIndex == +await row.getAttribute('data-index');
            }, 3000);
        } else {
            await sleep(500);
            return true;
        }
    }

    async changeTabUrl(tabIndex: number, newUrl: string) {
        const row = await this.openedTabsTestHelper.getTabRowByTabIndex(tabIndex);
        const isRowFound = !!row;

        await this.browserInstructionSender.changeTabUrl(tabIndex, newUrl);

        if (isRowFound) {
            await this.driver.wait(async () => {
                if (newUrl == await row.findElement(By.css('.title a')).getAttribute('data-url')) {
                    await sleep(500);
                    return true;
                }
            }, 3000);
        } else {
            await sleep(1000);
        }
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

    async openTabWithExtensionUrl(url: string, index?: number) {
        const newTabUrl = this.firefoxConfig.getExtensionUrl(url);
        return this.openTab(newTabUrl, index);
    }
}
