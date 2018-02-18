import { WebDriver } from 'selenium-webdriver';

import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { FollowedTabsTestHelper } from '../webdriver/test-helper/followed-tabs-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let followedTabsHelper: FollowedTabsTestHelper;
let openedTabsHelper: OpenedTabsTestHelper;

describe('Reader mode', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
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

    describe('Opened tabs tracking', () => {
        it('Reader mode indicator should be on in the opened tabs list when enabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOn(openedTabRowList[1]);

            await openedTabsHelper.waitThatReaderModeIndicatorIsFullyOn(openedTabRowList[1]);
            await testHelper.takeViewportScreenshot('reader-mode-indicator-on-open-list');
        });

        it('Reader mode indicator should be off in the opened tabs list when disabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);
            await testHelper.disableTabReaderMode(1, openedTabRowList[1]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(openedTabRowList[1]);
        });

        it('Should show opened tabs with reader mode enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const currentOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(2, currentOpenedTabRowList[2]);

            await testHelper.reloadExtension();

            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            await testHelper.openIgnoredTab(controlCenterDesktopUrl, 2);
            await testHelper.focusTab(2);
            await testHelper.switchToWindowHandle(2);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabReaderModeIndicatorIsOn(newOpenedTabRowList[1]);
        });
    });

    describe('Tab following', () => {
        it('Reader mode status of a followed tab should be updated when enabling reader mode on its associated opened tab', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, followedTabRowList[0]);

            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabReaderModeTestPageTitle(followedTabRowList[0]);

            await followedTabsHelper.waitThatReaderModeIndicatorIsFullyOn(followedTabRowList[0]);
            await testHelper.takeViewportScreenshot('reader-mode-indicator-on-follow-list');
        });

        it('Reader mode status of a followed tab should be updated when disabling reader mode on its associated opened tab', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await testHelper.disableTabReaderMode(1, followedTabRowList[0]);

            await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabReaderModeTestPageTitle(followedTabRowList[0]);
        });

        it('A click on a followed tab with reader mode enabled that is closed should open it in reader mode', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.enableTabReaderMode(2, openedTabRowList[2]);
            await testHelper.closeTab(2);
            await testHelper.clearRecentlyClosedTabs();

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[1]);

            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[1]);
        });

        it('Should show followed tabs with reader mode enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[3]);
            await testHelper.enableTabReaderMode(3, openedTabRowList[3]);

            await testHelper.closeTab(1);
            await testHelper.closeTab(3);
            await testHelper.clearRecentlyClosedTabs();
            await testHelper.reloadExtension();

            await testHelper.switchToWindowHandle(0);
            await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[1]);
            await followedTabsHelper.assertTabReaderModeTestPageTitle(followedTabRowList[2]);
            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[2]);
        });

        it('Should show followed tabs associated to opened tabs with reader mode enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.changeTabUrl(2, firefoxConfig.getReaderModeTestPageUrl());
            await testHelper.enableTabReaderMode(2, openedTabRowList[2]);

            await testHelper.openTab(null, 0);
            await testHelper.reloadExtension();
            await testHelper.switchToWindowHandle(0);
            await driver.get(firefoxConfig.getExtensionUrl('/ui/control-center-desktop.html'));

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReaderModeTestPageTitle(followedTabRowList[0]);
            await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabOpenIndicatorIsOn(followedTabRowList[1]);
            await followedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[1]);
        });

        it('Should update reader mode indicator at startup', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.setFollowedTabReaderModeStatusAsDisabled(followedTabRowList[0]);

            await testHelper.openTab(null, 0);
            await testHelper.reloadExtension();
            await testHelper.switchToWindowHandle(0);
            await driver.get(firefoxConfig.getExtensionUrl('/ui/control-center-desktop.html'));

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(newFollowedTabRowList[0]);
        });
    });

    describe('Browser recently closed tabs', () => {
        it('A followed tab should be restored in reader mode when it was so', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
        });

        it('Should update associated followed tab reader mode indicator when a recently closed tab is restored from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.toggleFollowedTabReaderModeIndicator(followedTabRowList[0]);

            await testHelper.restoreRecentlyClosedTab(0);
            await testHelper.focusTab(0);

            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
        });
    });
});
