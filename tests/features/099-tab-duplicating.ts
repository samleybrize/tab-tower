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

describe('Tab duplicating', () => {
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
        it('Duplicating a tab from the browser should open a new tab with the same properties', async () => {
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            await testHelper.openTab(testPage1Url);

            await testHelper.duplicateTab(1);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertNumberOfTabs(3);
            await openedTabsHelper.assertTabTitle(openedTabRowList[2], 'Test page 1');
            await openedTabsHelper.assertTabUrl(openedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        });

        it('Clicking on the duplicate button of an opened tab should open a new tab with the same properties', async () => {
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            await testHelper.openTab(testPage1Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabDuplicateButtonIsVisible(openedTabRowList[1]);
            await followedTabsHelper.assertTabDuplicateButtonIsNotDisabled(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertNumberOfTabs(3);
            await openedTabsHelper.assertTabTitle(newOpenedTabRowList[2], 'Test page 1');
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabFaviconUrl(newOpenedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));

            const tab = await browserInstructionSender.getTabByIndex(2);
            assert.equal(tab.title, 'Test page 1');
            assert.equal(tab.url, testPage1Url);
            assert.equal(tab.favIconUrl, firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));

            await openedTabsHelper.clickOnTabMoreButton(newOpenedTabRowList[1]);
            await testHelper.takeViewportScreenshot('duplicate-button-visible-open-list');
        });

        it('Clicking on the duplicate button should open a new tab at the last position', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            const originalTabId = await openedTabRowList[1].getAttribute('data-tab-id');
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            const duplicateTabId = await newOpenedTabRowList[2].getAttribute('data-tab-id');

            assert.notEqual(duplicateTabId, originalTabId);
        });
    });

    describe('Tab following', () => {
        it('Duplicating a followed tab from the browser should open a new tab with the same properties', async () => {
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            await testHelper.openTab(testPage1Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertNumberOfTabs(3);
            await openedTabsHelper.assertTabTitle(newOpenedTabRowList[2], 'Test page 1');
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabFaviconUrl(newOpenedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));
        });

        it('Clicking on the duplicate button of a followed tab should open a new tab with the same properties', async () => {
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            await testHelper.openTab(testPage1Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabDuplicateButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabDuplicateButtonIsNotDisabled(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertNumberOfTabs(3);
            await openedTabsHelper.assertTabTitle(newOpenedTabRowList[2], 'Test page 1');
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabFaviconUrl(newOpenedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));

            const tab = await browserInstructionSender.getTabByIndex(2);
            assert.equal(tab.title, 'Test page 1');
            assert.equal(tab.url, testPage1Url);
            assert.equal(tab.favIconUrl, firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTabMoreButton(followedTabRowList[0]);
            await testHelper.takeViewportScreenshot('duplicate-button-visible-follow-list');
        });

        it('Duplicating a followed tab from the browser should not follow the new tab', async () => {
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            await testHelper.openTab(testPage1Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.duplicateTab(1);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.assertNumberOfTabs(1);
        });

        it('Clicking on the duplicate button of a followed tab should not follow the new tab', async () => {
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            await testHelper.openTab(testPage1Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.assertNumberOfTabs(1);
        });

        it('Clicking on the duplicate button of a followed tab should open a new tab at the last position', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            const originalTabId = await openedTabRowList[1].getAttribute('data-tab-id');
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            const duplicateTabId = await newOpenedTabRowList[2].getAttribute('data-opened-tab-id');

            assert.notEqual(duplicateTabId, originalTabId);
        });

        it('A followed tab should not be duplicatable when its associated opened tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabCloseButton(followedTabRowList[0]);
            await followedTabsHelper.assertTabDuplicateButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabDuplicateButtonIsDisabled(followedTabRowList[0]);

            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0], false);

            await testHelper.showOpenedTabsList();
            await openedTabsHelper.assertNumberOfTabs(1);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTabMoreButton(followedTabRowList[0]);
            await testHelper.takeViewportScreenshot('duplicate-button-disabled-follow-list');
        });

        it('Clicking on the duplicate button of a followed tab at startup should not follow the new tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(firefoxConfig.getExtensionUrl(ExtensionUrl.UI), 0);
            await testHelper.switchToWindowHandle(0);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await followedTabsHelper.assertNumberOfTabs(1);
        });
    });

    describe('Reader mode', () => {
        it('Duplicating a tab with reader mode enabled from the browser should open a new tab with reader mode enabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an opened tab with reader mode enabled should open a new tab with reader mode enabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReaderModeIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of a followed tab with reader mode enabled should open a new tab with reader mode enabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await testHelper.enableTabReaderMode(1, openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabReaderModeIndicatorIsOn(newFollowedTabRowList[1]);
        });

        it('Duplicating a tab with reader mode disabled from the browser should open a new tab with reader mode disabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an opened tab with reader mode disabled should open a new tab with reader mode disabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of a followed tab with reader mode disabled should open a new tab with reader mode disabled', async () => {
            await testHelper.openTab(firefoxConfig.getReaderModeTestPageUrl());

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabReaderModeIndicatorIsOff(newFollowedTabRowList[1]);
        });
    });

    describe('Pinned tab', () => {
        it('Duplicating a pinned tab from the browser should open a new pinned tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabPinButton(openedTabRowList[1]);
            await testHelper.duplicateTab(0);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[1]);

            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabPinIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of a pinned opened tab should open a new pinned tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabPinButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[1]);

            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabPinIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of a pinned followed tab should open a new pinned tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabPinButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[1]);

            await openedTabsHelper.assertTabPinIndicatorIsOn(newOpenedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabPinIndicatorIsOn(newFollowedTabRowList[1]);
        });

        it('Duplicating an unpinned tab from the browser should open a new unpinned tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an unpinned opened tab should open a new unpinned tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabPinIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an unpinned followed tab should open a new unpinned tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabPinIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabPinIndicatorIsOff(newFollowedTabRowList[1]);
        });
    });

    describe('Audible tabs', () => {
        it('Duplicating an audible tab from the browser should open a new audible tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabAudibleIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an audible opened tab should open a new audible tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabAudibleIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabAudibleIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an audible followed tab should open a new audible tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_SOUND));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabAudibleIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOn(newFollowedTabRowList[1]);
        });

        it('Duplicating an inaudible tab from the browser should open a new inaudible tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabAudibleIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an inaudible opened tab should open a new inaudible tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabAudibleIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an inaudible followed tab should open a new inaudible tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabAudibleIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabAudibleIndicatorIsOff(newFollowedTabRowList[1]);
        });
    });

    describe('Tab muting', () => {
        it('Duplicating a muted tab from the browser should open a new muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabMuteIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of a muted opened tab should open a new muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabMuteIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabMuteIndicatorIsOn(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of a muted followed tab should open a new muted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMuteButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabMuteIndicatorIsOn(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOn(newFollowedTabRowList[1]);
        });

        it('Duplicating an unmuted tab from the browser should open a new unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await testHelper.duplicateTab(1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabMuteIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an unmuted opened tab should open a new unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabMuteIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOff(followedTabRowList[0]);
        });

        it('Clicking on the duplicate button of an unmuted followed tab should open a new unmuted tab', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabDuplicateButton(followedTabRowList[0]);

            await testHelper.showOpenedTabsList();
            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(newOpenedTabRowList[2]);

            await openedTabsHelper.assertTabMuteIndicatorIsOff(newOpenedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabMuteIndicatorIsOff(newFollowedTabRowList[1]);
        });
    });
});
