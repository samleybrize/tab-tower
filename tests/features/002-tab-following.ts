import { assert } from 'chai';
import { By, until, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { ExtensionUrl } from '../webdriver/extension-url';
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

describe('Tab following', () => {
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
        await driver.quit();
        browserInstructionSender.shutdown();
    });

    it('The no tab row should appear when there is no followed tab', async () => {
        await testHelper.showFollowedTabsList();

        await followedTabsHelper.assertNoTabRowIsVisible();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('Opened tabs should be followable', async () => {
        await testHelper.showOpenedTabsList();
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsVisible(openedTabRowList[0]);
        await openedTabsHelper.assertFollowButtonIsNotDisabled(openedTabRowList[0]);
    });

    it('Followed tabs should be shown in the followed tabs list', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);
        await testHelper.showFollowedTabsList();

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNoTabRowIsNotVisible();
        await followedTabsHelper.assertNumberOfTabs(1);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 1');
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
    });

    it('Opened tabs with a privileged url should not be followable', async () => {
        await testHelper.showOpenedTabsList();
        await testHelper.openTab();

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsVisible(openedTabRowList[1]);
        await openedTabsHelper.assertFollowButtonIsDisabled(openedTabRowList[1]);
    });

    it("Title, url and favicon should be updated when associated opened tab's url change", async () => {
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.showFollowedTabsList();
        await testHelper.changeTabUrl(1, testPage2Url);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNoTabRowIsNotVisible();
        await followedTabsHelper.assertNumberOfTabs(1);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 2');
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
    });

    it('A tab should be unfollowable in the opened tabs list', async () => {
        await testHelper.showOpenedTabsList();

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsNotVisible(openedTabRowList[0]);
        await openedTabsHelper.assertUnfollowButtonIsVisible(openedTabRowList[0]);
    });

    it('A tab should be unfollowable in the followed tabs list', async () => {
        await testHelper.showFollowedTabsList();

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertUnfollowButtonIsVisible(followedTabRowList[0]);
    });

    it('Reader mode status of a followed tab should be updated when enabling reader mode on its associated opened tab', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        const readerModeTestPageUrl = firefoxConfig.getReaderModeTestPageUrl();
        await testHelper.changeTabUrl(1, readerModeTestPageUrl);
        await testHelper.enableTabReaderMode(1, followedTabRowList[0]);

        await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertReaderModeTestPageTitle(followedTabRowList[0]);
    });

    it('Reader mode status of a followed tab should be updated when disabling reader mode on its associated opened tab', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await testHelper.disableTabReaderMode(1, followedTabRowList[0]);

        await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[0]);
        await followedTabsHelper.assertReaderModeTestPageTitle(followedTabRowList[0]);
    });

    it('Tab unfollowed from the opened tabs list should be removed from the followed tabs list', async () => {
        await testHelper.showOpenedTabsList();
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnUnfollowButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('Tab unfollowed from the followed tabs list should be removed from the followed tabs list', async () => {
        await testHelper.showOpenedTabsList();
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('Open status of a followed tab should be updated when closing its associated opened tab', async () => {
        await testHelper.showOpenedTabsList();
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        await testHelper.closeTab(1);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[0]);
    });

    it('Close button should not be shown when there is no associated opened tab', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertCloseButtonIsNotVisible(followedTabRowList[0]);
    });

    it('Associated opened tab should be closed when clicking on a close button in the followed tab list', async () => {
        await testHelper.showOpenedTabsList();
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabCloseButton(followedTabRowList[1]);

        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[1]);
    });

    it('The no tab row should appear when there is no followed tab anymore', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[1]);
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);

        await followedTabsHelper.assertNoTabRowIsVisible();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('A click on a followed tab that is closed should open it', async () => {
        await testHelper.showOpenedTabsList();
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        const tabFavivcon2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2);
        await testHelper.openTab(testPage2Url, 1);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();
        const openedTab = await browserInstructionSender.getTab(2);

        assert.equal(activeTab.index, 0);
        assert.isNotNull(openedTab);
        assert.equal(openedTab.favIconUrl, tabFavivcon2Url);
        assert.equal(openedTab.url, testPage2Url);
        assert.equal(openedTab.title, 'Test page 2');
    });

    it('A click on a followed tab with reader mode enabled that is closed should open it in reader mode', async () => {
        await testHelper.showOpenedTabsList();
        await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await testHelper.enableTabReaderMode(3, openedTabRowList[2]);

        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await testHelper.closeTab(3);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[1]);

        await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[1]);
    });

    it('A click on a followed tab that is opened should focus the associated opened tab', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 2);
    });

    it('A click on a followed tab whose associated opened tab was moved should focus the associated opened tab', async () => {
        await testHelper.focusTab(0);
        await testHelper.moveTab(2, 1);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 1);
    });

    it('A click on a followed tab should focus the associated opened tab when an ignored opened tab was moved', async () => {
        await testHelper.focusTab(0);
        await testHelper.moveTab(0, 2);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 0);
    });

    it('A click on a followed tab should focus the associated opened tab when an ignored opened tab was closed', async () => {
        await testHelper.focusTab(2);
        await testHelper.changeTabUrl(1, firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
        await testHelper.moveTab(1, 0, true);

        await testHelper.closeTab(0);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 0);
    });

    it('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.closeTab(2);
        await testHelper.closeTab(0);
        await testHelper.openTab(testPage1Url);

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);

        await testHelper.showOpenedTabsList();
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();

        await testHelper.switchToWindowHandle(1);
        await driver.get('about:config');
        await sleep(500);

        await testHelper.switchToWindowHandle(0);
        await testHelper.closeTab(1);

        const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabTitle(newFollowedTabRowList[1], 'Test page 1');
        await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage1Url);
        await followedTabsHelper.assertTabFaviconUrl(newFollowedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed (with click on previous button)', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);
        await testHelper.openTab();

        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.changeTabUrl(1, testPage2Url);

        await testHelper.showOpenedTabsList();
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();

        await testHelper.makeTabGoToPreviousPage(1);

        await testHelper.closeTab(1);

        const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabTitle(newFollowedTabRowList[1], 'Test page 2');
        await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
        await followedTabsHelper.assertTabFaviconUrl(newFollowedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
    });

    it('Should show followed tabs at startup', async () => {
        await testHelper.showOpenedTabsList();
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[1]);

        await testHelper.reloadExtension();

        await testHelper.switchToWindowHandle(0);
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));
        await testHelper.showFollowedTabsList();

        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const newFollowedTabRowList = await driver.findElements(By.css('#followedTabList tbody tr[data-follow-id]'));
        await followedTabsHelper.assertNoTabRowIsNotVisible();
        await followedTabsHelper.assertNumberOfTabs(2);
        await followedTabsHelper.assertTabTitle(newFollowedTabRowList[0], 'Test page 1');
        await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
        await followedTabsHelper.assertTabFaviconUrl(newFollowedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabTitle(newFollowedTabRowList[1], 'Test page 2');
        await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
        await followedTabsHelper.assertTabFaviconUrl(newFollowedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
    });

    it('Should show followed tabs with reader mode enabled at startup', async () => {
        await testHelper.showOpenedTabsList();
        await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);
        await testHelper.enableTabReaderMode(1, openedTabRowList[0]);

        await testHelper.closeTab(1);
        await testHelper.reloadExtension();

        await testHelper.switchToWindowHandle(0);
        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.UI));

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[0]);
        await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[1]);
        await followedTabsHelper.assertReaderModeTestPageTitle(followedTabRowList[2]);
        await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[2]);
    });

    it('Should show followed tabs associated to opened tabs at startup', async () => {
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[2]);
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[1]);
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);

        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);
        await testHelper.openTab(null, 0);

        await testHelper.showOpenedTabsList();
        const openedTabsRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabsRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabsRowList[1]);

        await testHelper.reloadExtension();
        await testHelper.switchToWindowHandle(0);
        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.UI));

        await testHelper.showFollowedTabsList();
        const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNumberOfTabs(2);
        await followedTabsHelper.assertTabOpenIndicatorIsOn(newFollowedTabRowList[0]);
        await followedTabsHelper.assertTabOpenIndicatorIsOn(newFollowedTabRowList[1]);

        await followedTabsHelper.clickOnTabTitle(newFollowedTabRowList[0]);
        let activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 2);

        await testHelper.focusTab(0);
        await followedTabsHelper.clickOnTabTitle(newFollowedTabRowList[1]);
        activeTab = await browserInstructionSender.getActiveTab();
        assert.equal(activeTab.index, 1);
    });

    it('Should show followed tabs associated to opened tabs with reader mode enabled at startup', async () => {
        await testHelper.focusTab(0);

        await testHelper.showOpenedTabsList();
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await testHelper.changeTabUrl(2, firefoxConfig.getReaderModeTestPageUrl());
        await testHelper.enableTabReaderMode(2, openedTabRowList[1]);

        await testHelper.openTab(null, 0);
        await testHelper.reloadExtension();
        await testHelper.switchToWindowHandle(0);
        await driver.get(firefoxConfig.getExtensionUrl('/ui/tab-tower.html'));

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertReaderModeTestPageTitle(followedTabRowList[0]);
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[1]);
        await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[1]);
    });
});
