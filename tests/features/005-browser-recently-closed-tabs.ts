import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../utils/browser-instruction-sender';
import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { FollowedTabsTestHelper } from '../webdriver/test-helper/followed-tabs-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let browserInstructionSender: BrowserInstructionSender;
let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let followedTabsHelper: FollowedTabsTestHelper;
let openedTabsHelper: OpenedTabsTestHelper;

describe('Browser recently closed tabs', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        browserInstructionSender = testHelper.getBrowserInstructionSender();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
    });
    after(async () => {
        await testHelper.shutdown();
    });
    beforeEach(async () => {
        await testHelper.resetBrowserState();
    });

    it('A recently closed tab restored from the browser should be associated to its followed tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

        await testHelper.showFollowedTabsList();
        await testHelper.restoreRecentlyClosedTab(0);
        await testHelper.focusTab(0);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        const recentlyClosedTabList = await browserInstructionSender.getAllRecentlyClosedTabs();
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 2');
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], testPage1Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'Test page 1');
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[1]);
        assert.strictEqual(recentlyClosedTabList.length, 1);
        assert.strictEqual(recentlyClosedTabList[0].tab.url, testPage1Url);
    });

    it('Opening a closed followed tab should restore its corresponding recently closed tab when available', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const recentlyClosedTabList = await browserInstructionSender.getAllRecentlyClosedTabs();
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 2');
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], testPage1Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'Test page 1');
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[1]);
        assert.strictEqual(recentlyClosedTabList.length, 1);
        assert.strictEqual(recentlyClosedTabList[0].tab.url, testPage1Url);
    });

    it('A tab that is not inserted in the recently closed tabs should not prevent other tabs to be restored', async () => {
        await testHelper.openTab();
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

        await testHelper.restoreRecentlyClosedTab(0);
        await testHelper.focusTab(0);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
    });

    it('A restored tab with a privileged url should be associated to the right followed tab and update its state', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

        await testHelper.switchToWindowHandle(2);
        await driver.get('about:config');
        await testHelper.switchToWindowHandle(0);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

        await testHelper.restoreRecentlyClosedTab(0);
        await testHelper.focusTab(0);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[1]);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.DEFAULT_FAVICON));
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], 'about:config');
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'about:config');
    });

    it('A restored tab should be opened at the last position', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const openedTab = await browserInstructionSender.getTabByIndex(2);
        assert.equal(openedTab.url, testPage1Url);
    });

    it('Restoring a tab should not change the focused tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const focusedTab = await browserInstructionSender.getActiveTab();
        assert.strictEqual(focusedTab.index, 0);
    });

    it('Restoring a tab from the browser then clicking on a followed tab should not open it twice', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        testHelper.restoreRecentlyClosedTab(0);
        followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);
        await sleep(1000);

        await openedTabsHelper.assertNumberOfTabs(2);
    });

    it('After a restart, a recently closed tab restored from the browser should be associated to its followed tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
        await testHelper.switchToWindowHandle(0);

        await testHelper.showFollowedTabsList();
        await testHelper.restoreRecentlyClosedTab(1);
        await testHelper.focusTab(0);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        const recentlyClosedTabList = await browserInstructionSender.getAllRecentlyClosedTabs();
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 2');
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], testPage1Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'Test page 1');
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[1]);
        assert.strictEqual(recentlyClosedTabList.length, 2);
        assert.strictEqual(recentlyClosedTabList[1].tab.url, testPage1Url);
    });

    it('After a restart, opening a closed followed tab should restore its corresponding recently closed tab when available', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
        await testHelper.switchToWindowHandle(0);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const recentlyClosedTabList = await browserInstructionSender.getAllRecentlyClosedTabs();
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 2');
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], testPage1Url);
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'Test page 1');
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[1]);
        assert.strictEqual(recentlyClosedTabList.length, 2);
        assert.strictEqual(recentlyClosedTabList[1].tab.url, testPage1Url);
    });
});
