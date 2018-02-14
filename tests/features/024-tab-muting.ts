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

describe('Tab muting', () => {
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
        it('Opened tabs should be mutable', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteButtonIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteButtonIsNotDisabled(openedTabRowList[0]);
            await openedTabsHelper.assertTabUnpinButtonIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteButtonIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabMuteButtonIsNotDisabled(openedTabRowList[1]);
            await openedTabsHelper.assertTabUnpinButtonIsNotVisible(openedTabRowList[1]);
        });

        it('Unmute button should be visible on the opened tabs list when muted', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await testHelper.muteTab(1);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteButtonIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabUnmuteButtonIsVisible(openedTabRowList[1]);
        });

        it('Mute button should be visible on the opened tabs list when unmuted', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await testHelper.muteTab(1);
            await testHelper.unmuteTab(1);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteButtonIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteButtonIsNotDisabled(openedTabRowList[0]);
            await openedTabsHelper.assertTabUnmuteButtonIsNotVisible(openedTabRowList[0]);
        });

        it('Mute indicator of an opened tab should be on when its associated tab is muted from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await testHelper.muteTab(1);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteIndicatorIsOn(openedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(0);
            const tab2 = await browserInstructionSender.getTab(1);
            assert.isFalse(tab1.mutedInfo.muted);
            assert.isTrue(tab2.mutedInfo.muted);
        });

        it('Mute indicator of an opened tab should be on when its associated tab is muted from the mute button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);

            await openedTabsHelper.assertTabMuteIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteIndicatorIsOn(openedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(0);
            const tab2 = await browserInstructionSender.getTab(1);
            assert.isFalse(tab1.mutedInfo.muted);
            assert.isTrue(tab2.mutedInfo.muted);
        });

        it('Mute indicator of an opened tab should be off when its associated tab is unmuted from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await testHelper.muteTab(1);
            await testHelper.unmuteTab(1);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteIndicatorIsOff(openedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(0);
            const tab2 = await browserInstructionSender.getTab(1);
            assert.isFalse(tab1.mutedInfo.muted);
            assert.isFalse(tab2.mutedInfo.muted);
        });

        it('Mute indicator of an opened tab should be off when its associated tab is unmuted from the unmute button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabUnmuteButton(openedTabRowList[1]);

            await openedTabsHelper.assertTabMuteIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabMuteIndicatorIsOff(openedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(0);
            const tab2 = await browserInstructionSender.getTab(1);
            assert.isFalse(tab1.mutedInfo.muted);
            assert.isFalse(tab2.mutedInfo.muted);
        });

        it('Should show muted opened tabs with mute indicator enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
            await testHelper.switchToWindowHandle(0);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOff(newOpenedTabRowList[0]);
            await openedTabsHelper.assertTabMuteIndicatorIsOn(newOpenedTabRowList[1]);
        });
    });

    describe('Tab following', () => {
        it('Followed tabs should be mutable', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsNotDisabled(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnpinButtonIsNotVisible(followedTabRowList[0]);
        });

        it('Unmute button should be visible on the followed tabs list when its associated opened tab is muted', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.muteTab(1);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteButtonIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabMuteButtonIsNotDisabled(followedTabRowList[1]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[1]);
        });

        it('Mute button should be visible on the followed tabs list when its associated opened tab is unmuted', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.muteTab(1);
            await testHelper.unmuteTab(1);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsNotDisabled(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabMuteButtonIsNotDisabled(followedTabRowList[1]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[1]);
        });

        it('Mute indicator of a followed tab should be on when its associated tab is muted from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.muteTab(1);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(1);
            const tab2 = await browserInstructionSender.getTab(2);
            assert.isTrue(tab1.mutedInfo.muted);
            assert.isFalse(tab2.mutedInfo.muted);
        });

        it('Mute indicator of a followed tab should be on when its associated tab is muted from the mute button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMuteButton(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(1);
            const tab2 = await browserInstructionSender.getTab(2);
            assert.isTrue(tab1.mutedInfo.muted);
            assert.isFalse(tab2.mutedInfo.muted);
        });

        it('Mute indicator of a followed tab should be off when its associated tab is unmuted from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.muteTab(1);
            await testHelper.unmuteTab(1);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(1);
            const tab2 = await browserInstructionSender.getTab(2);
            assert.isFalse(tab1.mutedInfo.muted);
            assert.isFalse(tab2.mutedInfo.muted);
        });

        it('Mute indicator of a followed tab should be off when its associated tab is unmuted from the mute button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMuteButton(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabUnmuteButton(followedTabRowList[1]);

            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[1]);

            const tab1 = await browserInstructionSender.getTab(1);
            const tab2 = await browserInstructionSender.getTab(2);
            assert.isFalse(tab1.mutedInfo.muted);
            assert.isFalse(tab2.mutedInfo.muted);
        });

        it('Mute indicator of a followed tab should not change when its associated opened tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[1]);
        });

        it('Followed tabs audio unmute button should not be hidden when its associated opened tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUnmuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[1]);
        });

        it('A followed tab should not be mutable when its associated opened tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMuteButton(followedTabRowList[0], false);

            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsDisabled(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[0]);
        });

        it('A followed tab should not be unmutable when its associated opened tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabUnmuteButton(followedTabRowList[0], false);

            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsDisabled(followedTabRowList[0]);
        });

        it('A followed tab should be restored with sound muted when it was so', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.clearRecentlyClosedTabs();

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            const tab = await browserInstructionSender.getTab(1);
            assert.isTrue(tab.mutedInfo.muted);
        });

        it('Mute indicator should be on when restoring a muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.clearRecentlyClosedTabs();

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
        });

        it('Mute indicator should be off when restoring an unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.clearRecentlyClosedTabs();

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
        });

        it('Unmute button should be visible when restoring a muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.clearRecentlyClosedTabs();

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteButtonIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsVisible(followedTabRowList[0]);
        });

        it('Mute button should be visible when restoring an unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.clearRecentlyClosedTabs();

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsNotDisabled(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[0]);
        });

        it('Should show followed tabs associated to muted opened tabs with mute indicator enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
            await testHelper.switchToWindowHandle(0);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[1]);
        });
    });

    describe('Browser recently closed tabs', () => {
        it('A followed tab should be restored with sound muted when it was so', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            const tab = await browserInstructionSender.getTab(1);
            assert.isTrue(tab.mutedInfo.muted);
        });

        it('Mute indicator should be on when restoring a muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
        });

        it('Mute indicator should be off when restoring an unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
        });

        it('Unmute button should be visible when restoring a muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteButtonIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsVisible(followedTabRowList[0]);
        });

        it('Mute button should be visible when restoring an unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabTitle(followedTabRowList[0]);

            await followedTabsHelper.assertTabMuteButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMuteButtonIsNotDisabled(followedTabRowList[0]);
            await followedTabsHelper.assertTabUnmuteButtonIsNotVisible(followedTabRowList[0]);
        });
    });
});
