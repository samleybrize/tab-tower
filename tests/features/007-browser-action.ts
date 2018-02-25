import { WebDriver } from 'selenium-webdriver';

import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let openedTabsHelper: OpenedTabsTestHelper;

describe('Browser action', () => {
    before(async () => {
        testHelper = new TestHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
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

    it('Browser action button should not have a followed badge when the active tab is not followed', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        await testHelper.focusTab(1);

        await testHelper.assertBrowserActionBadgeIsNotShown(1);
    });

    it('Browser action button should have a followed badge when the active tab is followed', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await testHelper.focusTab(1);

        await testHelper.assertBrowserActionBadgeIndicateThatTabIsFollowed(1);
    });

    it('Browser action button should have a followed badge when when switching to a followed tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await testHelper.focusTab(1);
        await testHelper.focusTab(2);

        await testHelper.assertBrowserActionBadgeIndicateThatTabIsFollowed(2);
    });

    it('Browser action button should not have a followed badge when when switching to a non-followed tab', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await testHelper.focusTab(2);
        await testHelper.focusTab(1);

        await testHelper.assertBrowserActionBadgeIsNotShown(1);
    });

    it('Browser action button should not have a followed badge when the active tab is not followed anymore', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
        await testHelper.focusTab(1);
        await testHelper.focusTab(0);
        await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);
        await testHelper.focusTab(1);

        await testHelper.assertBrowserActionBadgeIsNotShown(1);
    });
});
