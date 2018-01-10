import { assert } from 'chai';
import { By, until, WebDriver } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../webdriver/browser-instruction-sender';
import { ExtensionUrl } from '../webdriver/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { FollowedTabsTestHelper } from '../webdriver/test-helper/followed-tabs-test-helper';
import { NavigationTestHelper } from '../webdriver/test-helper/navigation-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let browserInstructionSender: BrowserInstructionSender;
let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let followedTabsHelper: FollowedTabsTestHelper;
let openedTabsHelper: OpenedTabsTestHelper;
let navigationHelper: NavigationTestHelper;

describe('Navigation', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        navigationHelper = testHelper.getNavigationHelper();
        browserInstructionSender = testHelper.getBrowserInstructionSender();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.UI));
    });
    after(async () => {
        await driver.quit();
        browserInstructionSender.shutdown();
    });

    it('Followed tabs list should be shown when clicking on the followed tabs button', async () => {
        await navigationHelper.clickOnFollowedTabsButton();

        await navigationHelper.assertOpenedTabsListIsNotVisible();
        await navigationHelper.assertFollowedTabsListIsVisible();
        await navigationHelper.assertBreadcrumbText('Followed tabs');
    });

    it('Opened tabs list should be shown when clicking on the opened tabs button', async () => {
        await navigationHelper.clickOnOpenedTabsButton();

        await navigationHelper.assertOpenedTabsListIsVisible();
        await navigationHelper.assertFollowedTabsListIsNotVisible();
        await navigationHelper.assertBreadcrumbText('Opened tabs');
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
        await testHelper.closeTab(1);

        await navigationHelper.assertOpenedTabsCounter(2);
    });

    it('Followed tabs counter should indicate 0 when there is no followed tab', async () => {
        await navigationHelper.assertFollowedTabsCounter(0);
    });

    it('Followed tabs counter should be updated when following a tab', async () => {
        const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
        await testHelper.openTab(testPage1Url);
        await testHelper.openTab(testPage1Url);

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

        await navigationHelper.assertFollowedTabsCounter(2);
    });

    it('Followed tabs counter should be updated when unfollowing a tab', async () => {
        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnUnfollowButton(openedTabRowList[1]);

        await navigationHelper.assertFollowedTabsCounter(1);
    });

    it('New tab should be opened when clicking on the new tab button', async () => {
        await navigationHelper.clickOnNewTabButton();
        await testHelper.focusTab(0);

        await navigationHelper.assertOpenedTabsCounter(5);
    });

    it('Opened tabs counter should indicate the number of opened tab at startup', async () => {
        await testHelper.reloadExtension();

        await testHelper.switchToWindowHandle(0);
        await testHelper.changeTabUrl(0, firefoxConfig.getExtensionUrl(ExtensionUrl.UI));

        await navigationHelper.assertOpenedTabsCounter(4);
    });

    it('Followed tabs counter should indicate the number of followed tab at startup', async () => {
        await testHelper.reloadExtension();

        await testHelper.switchToWindowHandle(0);
        await testHelper.changeTabUrl(0, firefoxConfig.getExtensionUrl(ExtensionUrl.UI));

        await navigationHelper.assertFollowedTabsCounter(1);
    });
});
