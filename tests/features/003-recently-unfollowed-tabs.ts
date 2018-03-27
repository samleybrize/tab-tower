import { WebDriver } from 'selenium-webdriver';

import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { FollowedTabsTestHelper } from '../webdriver/test-helper/followed-tabs-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { RecentlyUnfollowedTabsTestHelper } from '../webdriver/test-helper/recently-unfollowed-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let followedTabsHelper: FollowedTabsTestHelper;
let openedTabsHelper: OpenedTabsTestHelper;
let recentlyUnfollowedTabsHelper: RecentlyUnfollowedTabsTestHelper;

describe('Recently unfollowed tabs', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        recentlyUnfollowedTabsHelper = testHelper.getRecentlyUnfollowedTabsHelper();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));
    });
    after(async () => {
        await testHelper.shutdown();
    });
    beforeEach(async () => {
        await testHelper.resetBrowserState();
    });

    it('The no tab row should appear when there is no recently unfollowed tab', async () => {
        await testHelper.showRecentlyUnfollowedTabsList();

        await recentlyUnfollowedTabsHelper.assertNoTabRowIsVisible();
        await recentlyUnfollowedTabsHelper.assertNumberOfTabs(0);
    });

    it('Unfollowed tabs should be shown in the recently unfollowed tabs list', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.assertNumberOfTabs(2);
        await recentlyUnfollowedTabsHelper.assertTabTitle(recentlyUnfollowedTabRowList[0], 'Test page 2');
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[0], testPage2Url);
        await recentlyUnfollowedTabsHelper.assertTabFaviconUrl(recentlyUnfollowedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await recentlyUnfollowedTabsHelper.assertTabTitle(recentlyUnfollowedTabRowList[1], 'Test page 1');
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[1], testPage1Url);
        await recentlyUnfollowedTabsHelper.assertTabFaviconUrl(recentlyUnfollowedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('A click on the delete button should delete the recently unfollowed tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.clickOnTabDeleteButton(recentlyUnfollowedTabRowList[0]);

        const newRecentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.assertNumberOfTabs(1);
        await recentlyUnfollowedTabsHelper.assertTabTitle(newRecentlyUnfollowedTabRowList[0], 'Test page 1');
        await recentlyUnfollowedTabsHelper.assertTabUrl(newRecentlyUnfollowedTabRowList[0], testPage1Url);
        await recentlyUnfollowedTabsHelper.assertTabFaviconUrl(newRecentlyUnfollowedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('A click on the restore button should move the tab to followed tabs', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.clickOnTabRestoreButton(recentlyUnfollowedTabRowList[0]);

        const newRecentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.assertNumberOfTabs(1);
        await recentlyUnfollowedTabsHelper.assertTabUrl(newRecentlyUnfollowedTabRowList[0], testPage1Url);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNumberOfTabs(1);
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabOpenIndicatorIsOff(followedTabRowList[0]);
    });

    it('A restored recently unfollowed tab should be associated to its opened tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.clickOnTabRestoreButton(recentlyUnfollowedTabRowList[0]);

        await testHelper.showFollowedTabsList();
        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNumberOfTabs(1);
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage2Url);
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
    });

    it('Should show recently unfollowed tabs at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP), 0);
        await testHelper.switchToWindowHandle(0);
        await testHelper.showRecentlyUnfollowedTabsList();

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.assertNumberOfTabs(2);
        await recentlyUnfollowedTabsHelper.assertTabTitle(recentlyUnfollowedTabRowList[0], 'Test page 2');
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[0], testPage2Url);
        await recentlyUnfollowedTabsHelper.assertTabFaviconUrl(recentlyUnfollowedTabRowList[0], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_2));
        await recentlyUnfollowedTabsHelper.assertTabTitle(recentlyUnfollowedTabRowList[1], 'Test page 1');
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[1], testPage1Url);
        await recentlyUnfollowedTabsHelper.assertTabFaviconUrl(recentlyUnfollowedTabRowList[1], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
    });

    it('Should show restored followed tabs at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.clickOnTabRestoreButton(recentlyUnfollowedTabRowList[1]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP), 0);
        await testHelper.switchToWindowHandle(0);
        await testHelper.showFollowedTabsList();

        const followedTabRowList = await followedTabsHelper.getTabRowList();
        await followedTabsHelper.assertNumberOfTabs(1);
        await followedTabsHelper.assertTabUrl(followedTabRowList[0], testPage1Url);
        await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
    });

    it('Should keep only the last 5 recently unfollowed tabs', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
        const testPage3Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
        const testPage4Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_SOME_TEXT);
        const testPage5Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_OTHER_TEXT);
        const testPage6Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITHOUT_FAVICON);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage2Url);
        await testHelper.openTab(testPage3Url);
        await testHelper.openTab(testPage4Url);
        await testHelper.openTab(testPage5Url);
        await testHelper.openTab(testPage6Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[3]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[4]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[5]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[6]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[3]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[4]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[5]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[6]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.assertNumberOfTabs(5);
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[0], testPage6Url);
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[1], testPage5Url);
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[2], testPage4Url);
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[3], testPage3Url);
        await recentlyUnfollowedTabsHelper.assertTabUrl(recentlyUnfollowedTabRowList[4], testPage2Url);
    });
});
