import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
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

describe('Audible tabs', () => {
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
        it('Audible indicator of an opened tab should be on when its associated tab is playing a sound', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabAudibleIndicatorIsOn(openedTabRowList[1]);
        });

        it('Audible indicator of an opened tab should be off when its associated tab is not playing a sound anymore', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.pauseAudioElement(1, '#audio');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(openedTabRowList[1]);
        });

        it('Audible indicator of an opened tab should be on when its associated tab is playing a sound again', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.pauseAudioElement(1, '#audio');
            await testHelper.playAudioElement(1, '#audio');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabAudibleIndicatorIsOn(openedTabRowList[1]);
        });

        it('Should show audible opened tabs with audible indicator enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
            await testHelper.switchToWindowHandle(0);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabAudibleIndicatorIsOn(openedTabRowList[1]);
        });
    });

    describe('Tab following', () => {
        it('Audible indicator of a followed tab should be on when its associated tab is playing a sound', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[1]);
        });

        it('Audible indicator of a followed tab should be off when its associated tab is not playing a sound anymore', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.showFollowedTabsList();
            await testHelper.pauseAudioElement(1, '#audio');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[1]);
        });

        it('Audible indicator of a followed tab should be on when its associated tab is playing a sound again', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.showFollowedTabsList();
            await testHelper.pauseAudioElement(1, '#audio');
            await testHelper.playAudioElement(1, '#audio');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[1]);
        });

        it('Audible indicator of a followed tab should be off when its associated tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabCloseButton(followedTabRowList[0]);

            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[0]);
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[1]);
        });

        it('Should show followed tabs associated to audible opened tabs with audible indicator enabled at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);

            await testHelper.focusTab(1);
            await testHelper.focusTab(0);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
            await testHelper.switchToWindowHandle(0);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[1]);
        });
    });

    describe('Browser recently closed tabs', () => {
        it('Should update associated opened tab audible indicator when a recently closed tab is restored from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.restoreRecentlyClosedTab(0);
            await testHelper.focusTab(0);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(newOpenedTabRowList[0]);
            await openedTabsHelper.assertTabAudibleIndicatorIsOn(newOpenedTabRowList[1]);
        });

        it('Should update associated followed tab audible indicator when a recently closed tab is restored from the browser', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.restoreRecentlyClosedTab(0);
            await testHelper.focusTab(0);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOn(followedTabRowList[0]);
            await followedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[1]);
        });
    });
});
