import { WebDriver } from 'selenium-webdriver';

import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { NavigationTestHelper } from '../webdriver/test-helper/navigation-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { RecentlyUnfollowedTabsTestHelper } from '../webdriver/test-helper/recently-unfollowed-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let openedTabsHelper: OpenedTabsTestHelper;
let recentlyUnfollowedTabsHelper: RecentlyUnfollowedTabsTestHelper;
let navigationHelper: NavigationTestHelper;

describe('Navigation', () => {
    before(async () => {
        testHelper = new TestHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        recentlyUnfollowedTabsHelper = testHelper.getRecentlyUnfollowedTabsHelper();
        navigationHelper = testHelper.getNavigationHelper();
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

    it('Followed tabs list should be shown when clicking on the followed tabs button', async () => {
        await navigationHelper.clickOnFollowedTabsButton();

        await navigationHelper.assertOpenedTabsListIsNotVisible();
        await navigationHelper.assertFollowedTabsListIsVisible();
        await navigationHelper.assertRecentlyUnfollowedTabsListIsNotVisible();

        await navigationHelper.takeHeaderScreenshot('navigation-followed-button-clicked');
    });

    it('Recently unfollowed tabs list should be shown when clicking on the followed tabs button', async () => {
        await navigationHelper.clickOnRecentlyUnfollowedTabsButton();

        await navigationHelper.assertOpenedTabsListIsNotVisible();
        await navigationHelper.assertFollowedTabsListIsNotVisible();
        await navigationHelper.assertRecentlyUnfollowedTabsListIsVisible();

        await navigationHelper.takeHeaderScreenshot('navigation-recently-unfollowed-button-clicked');
    });

    it('Opened tabs list should be shown when clicking on the opened tabs button', async () => {
        await navigationHelper.clickOnFollowedTabsButton();
        await navigationHelper.clickOnOpenedTabsButton();

        await navigationHelper.assertOpenedTabsListIsVisible();
        await navigationHelper.assertFollowedTabsListIsNotVisible();
        await navigationHelper.assertRecentlyUnfollowedTabsListIsNotVisible();

        await navigationHelper.takeHeaderScreenshot('navigation-opened-button-clicked');
    });

    it('Opened tabs counter should indicate 1 when there is no opened tab', async () => {
        await navigationHelper.assertOpenedTabsCounter(1);
    });

    it('Opened tabs counter should be updated when opening a new tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        await navigationHelper.assertOpenedTabsCounter(3);
    });

    it('Opened tabs counter should be updated when closing a tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.closeTab(1);

        await navigationHelper.assertOpenedTabsCounter(1);
    });

    it('Followed tabs counter should indicate 0 when there is no followed tab', async () => {
        await navigationHelper.assertFollowedTabsCounter(0);
    });

    it('Followed tabs counter should be updated when following a tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

        await navigationHelper.assertFollowedTabsCounter(2);
    });

    it('Followed tabs counter should be updated when unfollowing a tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);

        await navigationHelper.assertFollowedTabsCounter(1);
    });

    it('Recently unfollowed tabs counter should indicate 0 when there is no recently unfollowed tab', async () => {
        await navigationHelper.assertRecentlyUnfollowedTabsCounter(0);
    });

    it('Recently unfollowed tabs counter should be updated when unfollowing a tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await navigationHelper.assertRecentlyUnfollowedTabsCounter(2);
    });

    it('Recently unfollowed tabs counter should be updated when deleting a recently unfollowed tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);

        await testHelper.showRecentlyUnfollowedTabsList();
        const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
        await recentlyUnfollowedTabsHelper.clickOnTabDeleteButton(recentlyUnfollowedTabRowList[0]);

        await navigationHelper.assertRecentlyUnfollowedTabsCounter(1);
    });

    it('New tab should be opened when clicking on the new tab button', async () => {
        await navigationHelper.clickOnNewTabButton();
        await testHelper.focusTab(0);

        await navigationHelper.assertOpenedTabsCounter(2);
    });

    it('Opened tabs counter should indicate the number of opened tab at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP), 0);
        await testHelper.switchToWindowHandle(0);

        await navigationHelper.assertOpenedTabsCounter(3);
    });

    it('Followed tabs counter should indicate the number of followed tab at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP), 0);
        await testHelper.switchToWindowHandle(0);

        await navigationHelper.assertFollowedTabsCounter(1);
    });

    it('Recently Unfollowed tabs counter should indicate the number of recently unfollowed tab at startup', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);

        await testHelper.reloadExtension();
        await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP), 0);
        await testHelper.switchToWindowHandle(0);

        await navigationHelper.assertRecentlyUnfollowedTabsCounter(1);
    });

    it('State of the opened tabs button with 999 tabs', async () => {
        await navigationHelper.changeShownNumberOfOpenedTabs(999);

        await navigationHelper.takeHeaderScreenshot('navigation-opened-button-with-999-tabs');
    });

    it('State of the followed tabs button with 999 tabs', async () => {
        await navigationHelper.changeShownNumberOfFollowedTabs(999);

        await navigationHelper.takeHeaderScreenshot('navigation-followed-button-with-999-tabs');
    });

    it('State of the recently unfollowed tabs button with 999 tabs', async () => {
        await navigationHelper.changeShownNumberOfRecentlyUnfollowedTabs(999);

        await navigationHelper.takeHeaderScreenshot('navigation-recently-unfollowed-button-with-999-tabs');
    });
});