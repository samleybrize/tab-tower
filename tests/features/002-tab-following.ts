import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

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
        await testHelper.shutdown();
    });
    beforeEach(async () => {
        await testHelper.resetBrowserState();
    });

    it('The no tab row should appear when there is no followed tab', async () => {
        await testHelper.showFollowedTabsList();

        await followedTabsHelper.assertNoTabRowIsVisible();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('Opened tabs should be followable', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsVisible(openedTabRowList[0]);
        await openedTabsHelper.assertFollowButtonIsDisabled(openedTabRowList[0]);
        await openedTabsHelper.assertUnfollowButtonIsNotVisible(openedTabRowList[0]);
        await openedTabsHelper.assertFollowButtonIsVisible(openedTabRowList[1]);
        await openedTabsHelper.assertFollowButtonIsNotDisabled(openedTabRowList[1]);
        await openedTabsHelper.assertUnfollowButtonIsNotVisible(openedTabRowList[1]);
    });

    it('Followed tabs should be shown in the followed tabs list', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNoTabRowIsNotVisible();
        await followedTabsHelper.assertNumberOfTabs(1);
        await followedTabsHelper.assertTabTitle(followedTabRowList[0], 'Test page 1');
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage1Url);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
        await followedTabsHelper.assertLastAccessDateIsRoughlyEqualToDate(followedTabRowList[0], new Date());
        await followedTabsHelper.assertTabTitleTooltip(followedTabRowList[0], 'Go to tab');
    });

    it('Opened tabs with a privileged url should not be followable', async () => {
        await testHelper.openTab();

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsVisible(openedTabRowList[1]);
        await openedTabsHelper.assertFollowButtonIsDisabled(openedTabRowList[1]);
        await openedTabsHelper.assertUnfollowButtonIsNotVisible(openedTabRowList[0]);
    });

    it('Opened tabs with an ignored url should not be followable', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsVisible(openedTabRowList[0]);
        await openedTabsHelper.assertFollowButtonIsDisabled(openedTabRowList[0]);
        await openedTabsHelper.assertUnfollowButtonIsNotVisible(openedTabRowList[0]);
    });

    it("Title, url and favicon should be updated when associated opened tab's url change", async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab();

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

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

    it('Should update the last access date when focusing associated opened tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.changeTabLastAccessText(followedTabRowList[0], 'text 1');
        await followedTabsHelper.changeTabLastAccessText(followedTabRowList[1], 'text 2');
        await testHelper.focusTab(1);
        await testHelper.focusTab(0);

        await followedTabsHelper.assertLastAccessDateIsRoughlyEqualToDate(followedTabRowList[0], new Date());
        await followedTabsHelper.assertLastAccessDateIsEqualToString(followedTabRowList[1], 'text 2');
    });

    it('A tab should be unfollowable in the opened tabs list', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await openedTabsHelper.assertFollowButtonIsNotVisible(openedTabRowList[1]);
        await openedTabsHelper.assertUnfollowButtonIsVisible(openedTabRowList[1]);
    });

    it('A tab should be unfollowable in the followed tabs list', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertUnfollowButtonIsVisible(followedTabRowList[0]);
    });

    it('Tab unfollowed from the opened tabs list should be removed from the followed tabs list', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnUnfollowButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('Tab unfollowed from the followed tabs list should be removed from the followed tabs list', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('Open status of a followed tab should be updated when closing its associated opened tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

        await testHelper.closeTab(1);
        await testHelper.clearRecentlyClosedTabs();

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[0]);
        await followedTabsHelper.assertTabTitleTooltip(followedTabRowList[0], 'Open tab');
    });

    it('Close button should not be shown when there is no associated opened tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

        await testHelper.closeTab(1);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertCloseButtonIsNotVisible(followedTabRowList[0]);
    });

    it('Associated opened tab should be closed when clicking on the close button in the followed tab list', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabCloseButton(followedTabRowList[1]);

        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[1]);
    });

    it('The no tab row should appear when there is no followed tab anymore', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[0]);

        await followedTabsHelper.assertNoTabRowIsVisible();
        await followedTabsHelper.assertNumberOfTabs(0);
    });

    it('A click on a followed tab that is closed should open it', async () => {
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        const tabFavicon2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2);
        await testHelper.openTab(testPage2Url);
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
        await testHelper.clearRecentlyClosedTabs();

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();
        const openedTab = await browserInstructionSender.getTab(2);

        assert.equal(activeTab.index, 0);
        assert.isNotNull(openedTab);
        assert.equal(openedTab.favIconUrl, tabFavicon2Url);
        assert.equal(openedTab.url, testPage2Url);
        assert.equal(openedTab.title, 'Test page 2');
    });

    it('Two clicks on a followed tab that is closed should open it once', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
        await testHelper.clearRecentlyClosedTabs();

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickTwoTimesOnTabTitle(followedTabRowList[0]);

        await openedTabsHelper.assertNumberOfTabs(2);
    });

    it('A click on a followed tab that is opened should focus the associated opened tab', async () => {
        await testHelper.openTab(null);
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[3]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 2);
    });

    it('A click on a followed tab whose associated opened tab was moved should focus the associated opened tab', async () => {
        await testHelper.openTab(null);
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[3]);

        await testHelper.moveTab(2, 1);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 1);
    });

    it('A click on a followed tab should focus the associated opened tab when an ignored opened tab was moved', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2), 0);
        await testHelper.openTab(null, 1);
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1), 3);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[3]);

        await testHelper.changeTabUrl(1, firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
        await testHelper.moveTab(1, 0);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 1);
    });

    it('A click on a followed tab should focus the associated opened tab when an ignored opened tab was closed', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2), 0);
        await testHelper.openTab(null, 1);
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1), 3);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[0]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[3]);

        await testHelper.changeTabUrl(1, firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
        await testHelper.moveTab(1, 0);

        await testHelper.closeTab(0);
        await testHelper.clearRecentlyClosedTabs();

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

        const activeTab = await browserInstructionSender.getActiveTab();

        assert.equal(activeTab.index, 0);
    });

    it('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.switchToWindowHandle(1);
        await driver.get('about:config');
        await sleep(500);

        await testHelper.switchToWindowHandle(0);
        await testHelper.closeTab(1);
        await testHelper.clearRecentlyClosedTabs();

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'Test page 1');
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], testPage1Url);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('A followed tab should be updated to the last non-privileged url when its associated opened tab is closed (with click on previous button)', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab();

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.openTab();
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.changeTabUrl(2, testPage2Url);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

        await testHelper.showFollowedTabsList();

        await testHelper.makeTabGoToPreviousPage(2);

        await testHelper.closeTab(2);
        await testHelper.clearRecentlyClosedTabs();

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertTabTitle(followedTabRowList[1], 'Test page 2');
        await followedTabsHelper.assertTabUrl(followedTabRowList[1], testPage2Url);
        await followedTabsHelper.assertTabFaviconUrl(followedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
    });

    it('A duplicated tab should never be followed', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);

        await testHelper.duplicateTab(1);

        const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.assertFollowButtonIsVisible(newOpenedTabRowList[2]);
        await openedTabsHelper.assertFollowButtonIsNotDisabled(newOpenedTabRowList[2]);
        await openedTabsHelper.assertUnfollowButtonIsNotVisible(newOpenedTabRowList[2]);

        await testHelper.showFollowedTabsList();
        await followedTabsHelper.assertNumberOfTabs(1);
    });

    it('Should show followed tabs at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        const tabOpenDate = new Date();
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[3]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.clickOnUnfollowButton(followedTabRowList[1]);

        await testHelper.reloadExtension();

        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
        await testHelper.switchToWindowHandle(0);
        await testHelper.showFollowedTabsList();

        const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNoTabRowIsNotVisible();
        await followedTabsHelper.assertNumberOfTabs(2);
        await followedTabsHelper.assertTabTitle(newFollowedTabRowList[0], 'Test page 1');
        await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
        await followedTabsHelper.assertTabFaviconUrl(newFollowedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        await followedTabsHelper.assertTabTitle(newFollowedTabRowList[1], 'Test page 2');
        await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
        await followedTabsHelper.assertTabFaviconUrl(newFollowedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await followedTabsHelper.assertLastAccessDateIsRoughlyEqualToDate(newFollowedTabRowList[1], tabOpenDate);
    });

    it('Should show followed tabs associated to opened tabs at startup', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabsRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabsRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabsRowList[1]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
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
});
