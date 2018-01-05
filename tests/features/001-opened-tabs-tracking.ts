import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { ExtensionUrl } from '../webdriver/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let browserInstructionSender: BrowserInstructionSender;
let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let openedTabsHelper: OpenedTabsTestHelper;

describe('Opened tabs tracking', () => {
    before(async () => {
        testHelper = new TestHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        browserInstructionSender = testHelper.getBrowserInstructionSender();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
    });
    after(async () => {
        await driver.quit();
        browserInstructionSender.shutdown();
    });

    it('The no tab row should appear when there is no opened tab', async () => {
        await openedTabsHelper.assertNoTabRowIsVisible();
        await openedTabsHelper.assertNumberOfTabs(0);
    });

    it('Opened tab should appear in the opened tabs list', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(1);
        await openedTabsHelper.assertTabTitle(openedTabRowList[0], 'Test page 1');
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], testPage1Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it("Title, url and favicon should be updated when an opened tab's url change", async () => {
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.changeTabUrl(1, testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(1);
        await openedTabsHelper.assertTabTitle(openedTabRowList[0], 'Test page 2');
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], testPage2Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
    });

    it('Default favicon should be shown when an opened tab have not', async () => {
        const testPageWithoutFaviconUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITHOUT_FAVICON);
        await testHelper.changeTabUrl(1, testPageWithoutFaviconUrl);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.DEFAULT_FAVICON));
    });

    it("Default favicon should be shown when an opened tab's favicon can't be downloaded", async () => {
        const testPageWithNotFoundFaviconUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_NOT_FOUND_FAVICON);
        await testHelper.changeTabUrl(1, testPageWithNotFoundFaviconUrl);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.DEFAULT_FAVICON));
    });

    it('Reader mode should be shown in the opened tabs list when enabled', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        const readerModeTestPageUrl = firefoxConfig.getReaderModeTestPageUrl();

        await testHelper.changeTabUrl(1, readerModeTestPageUrl);
        await testHelper.enableTabReaderMode(1, openedTabRowList[0]);

        await openedTabsHelper.assertTabReaderModeIndicatorIsOn(openedTabRowList[0]);
    });

    it('Reader mode should not be shown in the opened tabs list when disabled', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();

        await testHelper.disableTabReaderMode(1, openedTabRowList[0]);

        await openedTabsHelper.assertTabReaderModeIndicatorIsOff(openedTabRowList[0]);
    });

    it('Opened tab should be removed from opened tabs list when closed', async () => {
        await testHelper.closeTab(1);

        await openedTabsHelper.assertNumberOfTabs(0);
    });

    it('The no tab row should appear when there is no opened tab anymore', async () => {
        await openedTabsHelper.assertNoTabRowIsVisible();
    });

    it('Rows in the opened tab list should be moved when an opened tab is moved', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);
        await testHelper.moveTab(1, 2);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(2);
        await openedTabsHelper.assertTabTitle(openedTabRowList[0], 'Test page 2');
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], testPage2Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await openedTabsHelper.assertTabTitle(openedTabRowList[1], 'Test page 1');
        await openedTabsHelper.assertTabUrl(openedTabRowList[1], testPage1Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('Associated tab should be closed when clicking on a close button in the opened tab list', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[0]);

        const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNumberOfTabs(1);
        await openedTabsHelper.assertTabTitle(newOpenedTabRowList[0], 'Test page 1');
        await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await openedTabsHelper.assertTabFaviconUrl(newOpenedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('A click on an opened tab should focus the associated tab', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabTitle(openedTabRowList[0]);
        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 1);
    });

    it('A click on an opened tab should focus the associated tab when an ignored tab was moved', async () => {
        const uiUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.UI);
        await testHelper.openIgnoredTab(uiUrl, 2);
        await testHelper.moveTab(2, 1);
        await testHelper.focusTab(0);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabTitle(openedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 2);
    });

    it('A click on an opened tab should focus the associated tab when an ignored tab was closed', async () => {
        await testHelper.closeTab(1);
        await testHelper.focusTab(0);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabTitle(openedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 1);
    });

    it('Should show opened tabs at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);

        await testHelper.focusTab(0);
        await testHelper.openTab(testPage2Url);
        await testHelper.openTab();

        await testHelper.reloadExtension();

        await testHelper.switchToWindowHandle(2);
        await testHelper.changeTabUrl(2, firefoxConfig.getExtensionUrl(ExtensionUrl.UI));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(2);
        await openedTabsHelper.assertTabTitle(openedTabRowList[0], 'Test page 1');
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], testPage1Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await openedTabsHelper.assertTabTitle(openedTabRowList[1], 'Test page 2');
        await openedTabsHelper.assertTabUrl(openedTabRowList[1], testPage2Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
    });

    it('Should show opened tabs with reader mode enabled at startup', async () => {
        const currentOpenedTabRowList = await openedTabsHelper.getTabRowList();
        const currentReaderModeIndicator = await openedTabsHelper.getReaderModeIndicator(currentOpenedTabRowList[1]);

        await testHelper.changeTabUrl(1, firefoxConfig.getReaderModeTestPageUrl());
        await testHelper.enableTabReaderMode(1, currentOpenedTabRowList[1]);

        await testHelper.reloadExtension();

        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 2);
        await testHelper.focusTab(2);
        await testHelper.switchToWindowHandle(2);

        const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertTabReaderModeIndicatorIsOn(newOpenedTabRowList[1]);
    });

    it('Incognito tabs should not be shown in the opened tabs list', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.closeTab(1);
        await testHelper.closeTab(0);
        await testHelper.createWindow(true, testPage1Url);

        await openedTabsHelper.assertNumberOfTabs(0);
    });
});
