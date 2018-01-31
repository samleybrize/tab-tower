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
let uiUrl: string;

describe('Opened tabs tracking', () => {
    before(async () => {
        testHelper = new TestHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        browserInstructionSender = testHelper.getBrowserInstructionSender();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();
        uiUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.UI);

        await driver.get(uiUrl);
    });
    after(async () => {
        await testHelper.shutdown();
    });
    beforeEach(async () => {
        await testHelper.resetBrowserState();
    });

    it('Opened tab should appear in the opened tabs list', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(2);
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], uiUrl);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.EXTENSION_FAVICON));
        await openedTabsHelper.assertTabTitle(openedTabRowList[1], 'Test page 1');
        await openedTabsHelper.assertTabUrl(openedTabRowList[1], testPage1Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it("Title, url and favicon should be updated when an opened tab's url change", async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.changeTabUrl(1, testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(2);
        await openedTabsHelper.assertTabTitle(openedTabRowList[1], 'Test page 2');
        await openedTabsHelper.assertTabUrl(openedTabRowList[1], testPage2Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
    });

    it('Should update the last access date when focusing a tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.changeTabLastAccessText(openedTabRowList[1], 'text 1');
        await openedTabsHelper.changeTabLastAccessText(openedTabRowList[2], 'text 2');
        await testHelper.focusTab(1);
        await testHelper.focusTab(0);

        await openedTabsHelper.assertLastAccessDateIsRoughlyEqualToDate(openedTabRowList[1], new Date());
        await openedTabsHelper.assertLastAccessDateIsEqualToString(openedTabRowList[2], 'text 2');
    });

    it('Default favicon should be shown when an opened tab have not', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITHOUT_FAVICON));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.DEFAULT_FAVICON));
    });

    it("Default favicon should be shown when an opened tab's favicon can't be downloaded", async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_NOT_FOUND_FAVICON));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.DEFAULT_FAVICON));
    });

    it('Opened tab should be removed from opened tabs list when closed', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.closeTab(1);

        await openedTabsHelper.assertNumberOfTabs(1);
    });

    it('Rows in the opened tab list should be moved when an opened tab is moved', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);
        await testHelper.moveTab(1, 2);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(3);
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], uiUrl);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.EXTENSION_FAVICON));
        await openedTabsHelper.assertTabTitle(openedTabRowList[1], 'Test page 2');
        await openedTabsHelper.assertTabUrl(openedTabRowList[1], testPage2Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await openedTabsHelper.assertTabTitle(openedTabRowList[2], 'Test page 1');
        await openedTabsHelper.assertTabUrl(openedTabRowList[2], testPage1Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('Associated tab should be closed when clicking on a close button in the opened tab list', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

        const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNumberOfTabs(2);
        await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], uiUrl);
        await openedTabsHelper.assertTabFaviconUrl(newOpenedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.EXTENSION_FAVICON));
        await openedTabsHelper.assertTabTitle(newOpenedTabRowList[1], 'Test page 1');
        await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await openedTabsHelper.assertTabFaviconUrl(newOpenedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('A click on an opened tab should focus the associated tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabTitle(openedTabRowList[1]);

        const activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 1);
    });

    it('A click on an opened tab should focus the associated tab when an ignored tab was moved', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openIgnoredTab(uiUrl, 2);
        await testHelper.moveTab(2, 1);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabTitle(openedTabRowList[2]);

        const activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 2);
    });

    it('A click on an opened tab should focus the associated tab when an ignored tab was closed', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabTitle(openedTabRowList[1]);

        const activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 1);
    });

    it('Should show opened tabs at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);

        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);
        await testHelper.openTab();

        await testHelper.reloadExtension();

        await testHelper.switchToWindowHandle(2);
        await testHelper.changeTabUrl(2, uiUrl);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertNoTabRowIsNotVisible();
        await openedTabsHelper.assertNumberOfTabs(3);
        await openedTabsHelper.assertTabTitle(openedTabRowList[0], 'Test page 1');
        await openedTabsHelper.assertTabUrl(openedTabRowList[0], testPage1Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await openedTabsHelper.assertTabTitle(openedTabRowList[1], 'Test page 2');
        await openedTabsHelper.assertTabUrl(openedTabRowList[1], testPage2Url);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await openedTabsHelper.assertTabUrl(openedTabRowList[2], uiUrl);
        await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.EXTENSION_FAVICON));
    });

    it('Incognito tabs should not be shown in the opened tabs list', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.createWindow(true, firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        await openedTabsHelper.assertNumberOfTabs(1);
    });
});
