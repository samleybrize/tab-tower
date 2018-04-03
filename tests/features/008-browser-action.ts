import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../utils/browser-instruction-sender';
import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { BrowserActionTestHelper } from '../webdriver/test-helper/browser-action-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let openedTabsHelper: OpenedTabsTestHelper;
let browserActionHelper: BrowserActionTestHelper;
let browserInstructionSender: BrowserInstructionSender;

describe('Browser action', () => {
    before(async () => {
        testHelper = new TestHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        browserActionHelper = testHelper.getBrowserActionHelper();
        browserInstructionSender = testHelper.getBrowserInstructionSender();
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

    describe('Button', () => {
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

        it('Browser action button should have a followed badge when switching to a followed tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await testHelper.focusTab(1);
            await testHelper.focusTab(2);

            await testHelper.assertBrowserActionBadgeIndicateThatTabIsFollowed(2);
        });

        it('Browser action button should not have a followed badge when switching to a non-followed tab', async () => {
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

        it('Browser action button should have a followed badge when a followed tab navigates to a new url', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await testHelper.focusTab(1);

            await testHelper.changeTabUrl(1, firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.focusTab(0);

            await testHelper.assertBrowserActionBadgeIndicateThatTabIsFollowed(1);
        });
    });

    describe('Popup', () => {
        it('Should indicate that the current tab is not followed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.BROWSER_ACTION));
            await testHelper.switchToWindowHandle(1);

            await browserActionHelper.waitViewIsInitialized();

            await browserActionHelper.assertUnfollowIndicatorIsVisible();
            await browserActionHelper.assertFollowIndicatorIsNotVisible();
        });

        it('Should indicate that the current tab is followed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.BROWSER_ACTION));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await browserInstructionSender.reloadTab(1);
            await testHelper.switchToWindowHandle(1);

            await browserActionHelper.waitViewIsInitialized();
            await browserActionHelper.assertUnfollowIndicatorIsNotVisible();
            await browserActionHelper.assertFollowIndicatorIsVisible();
        });

        it('A click on the follow button should follow the current tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.BROWSER_ACTION));
            await browserInstructionSender.reloadTab(1);
            await testHelper.switchToWindowHandle(1);

            await browserActionHelper.waitViewIsInitialized();
            await browserActionHelper.clickOnFollowButton();

            await testHelper.switchToWindowHandle(0);
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabFollowIndicatorIsOn(openedTabRowList[1]);
        });

        it('A click on the unfollow button should unfollow the current tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.BROWSER_ACTION));
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await browserInstructionSender.reloadTab(1);
            await testHelper.switchToWindowHandle(1);

            await browserActionHelper.waitViewIsInitialized();
            await browserActionHelper.clickOnUnfollowButton();

            await testHelper.switchToWindowHandle(0);
            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[1]);
        });

        it('A click on the control center link should open the control center', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.BROWSER_ACTION));
            await testHelper.switchToWindowHandle(1);

            await browserActionHelper.clickOnGoToControlCenterButton();

            const activeTab = await browserInstructionSender.getActiveTab();
            assert.equal(activeTab.url, firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));
        });
    });
});
