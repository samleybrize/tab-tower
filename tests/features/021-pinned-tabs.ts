import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

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

describe('Pinned tabs', () => {
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

    describe('Opened tabs tracking', () => {
        it('Tab pin indicator should be on in the opened tabs list when pinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.pinTab(1, openedTabRowList[1]);

            await openedTabsHelper.assertTabPinIndicatorIsOn(openedTabRowList[1]);
        });

        it('Tab pin indicator should be off in the opened tabs list when unpinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.pinTab(1, openedTabRowList[1]);
            await openedTabsHelper.pinTab(2, openedTabRowList[2]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.unpinTab(1, newOpenedTabRowList[1]);

            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[1]);
        });

        it('Opened tabs should be pinable', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertPinButtonIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertUnpinButtonIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertPinButtonIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertUnpinButtonIsNotVisible(openedTabRowList[1]);
        });

        it('Tab unpin button should be visible in the opened tabs list when pinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.pinTab(1, openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertPinButtonIsNotVisible(newOpenedTabRowList[0]);
            await openedTabsHelper.assertUnpinButtonIsVisible(newOpenedTabRowList[0]);
        });

        it('Tab pin button should be visible in the opened tabs list when unpinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.pinTab(1, openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.unpinTab(0, newOpenedTabRowList[0]);

            await openedTabsHelper.assertPinButtonIsVisible(newOpenedTabRowList[0]);
            await openedTabsHelper.assertUnpinButtonIsNotVisible(newOpenedTabRowList[0]);
        });

        it('A click on an opened tab should focus the associated tab when another tab was pinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.pinTab(2, openedTabRowList[2]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabTitle(newOpenedTabRowList[2]);

            const activeTab = await browserInstructionSender.getActiveTab();
            assert.equal(activeTab.index, 2);
        });

        it('A click on an opened tab pin button should pin the associated tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnPinButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[0]);
            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[1]);
            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[2]);
        });

        it('A click on an opened tab unpin button should unpin the associated tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnPinButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnPinButton(openedTabRowList[2]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnUnpinButton(newOpenedTabRowList[1]);

            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[0]);
            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[1]);
            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[2]);
        });

        it('Should show pinned opened tabs with pin indicator enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.pinTab(1, openedTabRowList[1]);
            await openedTabsHelper.pinTab(2, openedTabRowList[2]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 2);
            await testHelper.switchToWindowHandle(2);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[0]);
            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[1]);
            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[2]);
        });
    });

    describe('Tab following', () => {
        it('Pin indicator of a followed tab should be on when its associated opened tab is pinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnPinButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabPinIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[1]);
        });

        it('Pin indicator of a followed tab should be off when its associated opened tab is unpinned', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnPinButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnUnpinButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[1]);
        });

        xit('Tab unpin button should be visible in the followed tabs list when its associated opened tab is pinned', async () => {
            // TODO
        });

        xit('Tab pin button should be visible in the followed tabs list when its associated opened tab is unpinned', async () => {
            // TODO
        });

        it('A click on a followed tab pin button should pin the associated tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnPinButton(followedTabRowList[0]);

            await followedTabsHelper.assertTabPinIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[1]);
        });

        it('A click on a followed tab unpin button should unpin the associated tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnPinButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnPinButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnUnpinButton(followedTabRowList[0]);

            await followedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabPinIndicatorIsOn(followedTabRowList[1]);
        });

        xit('Pin indicator of a followed tab should be off when its associated tab is closed', async () => {
            // TODO
        });

        xit('Pin button of a followed tab should be disabled when its associated tab is closed', async () => {
            // TODO
        });

        xit('Pin indicator of an opened tab should be on when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Pin indicator of an opened tab should be off when restoring an unpinned tab', async () => {
            // TODO
        });

        xit('Pin indicator of a followed tab should be on when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Pin indicator of a followed tab should be off when restoring an unpinned tab', async () => {
            // TODO
        });

        xit('Pin button of an opened tab should be visible when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Unpin button of an opened tab should be visible when restoring an unpinned tab', async () => {
            // TODO
        });

        xit('Pin button of a followed tab should be on when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Unpin button of a followed tab should be on when restoring an unpinned tab', async () => {
            // TODO
        });

        it('Should show followed tabs associated to pinned opened tabs with pin indicator enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnPinButton(openedTabRowList[1]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 2);
            await testHelper.switchToWindowHandle(2);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabPinIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[1]);
        });
    });

    describe('Browser recently closed tabs', () => {
        xit('Pin indicator of an opened tab should be on when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Pin indicator of an opened tab should be off when restoring an unpinned tab', async () => {
            // TODO
        });

        xit('Pin indicator of a followed tab should be on when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Pin indicator of a followed tab should be off when restoring an unpinned tab', async () => {
            // TODO
        });

        xit('Pin button of an opened tab should be visible when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Unpin button of an opened tab should be visible when restoring an unpinned tab', async () => {
            // TODO
        });

        xit('Pin button of a followed tab should be on when restoring a pinned tab', async () => {
            // TODO
        });

        xit('Unpin button of a followed tab should be on when restoring an unpinned tab', async () => {
            // TODO
        });
    });
});
