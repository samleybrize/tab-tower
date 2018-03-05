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

describe('Tab moving', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
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

    describe('Opened tabs tracking', () => {
        let controlCenterDesktopUrl: string;
        let testPage1Url: string;
        let testPage2Url: string;
        let testFilter1Url: string;

        beforeEach(async () => {
            controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);

            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);
        });

        it('A click on the tab move button should enable move mode', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);

            await openedTabsHelper.assertNoTabSelectorIsVisible();
            await openedTabsHelper.assertNoTabMoreButtonIsVisible();
            await openedTabsHelper.assertNoTabIndicatorIsVisible();
            await openedTabsHelper.assertMoveAboveOthersButtonIsVisible();
            await openedTabsHelper.assertTabMoveBelowButtonIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabMoveBelowButtonIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabMoveBelowButtonIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabMoveBelowButtonIsVisible(openedTabRowList[3]);

            await testHelper.takeViewportScreenshot('opened-tabs-list-move-mode-enabled');
        });

        it('A click on the tab move button should highlight the tab row to move', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);

            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[0]);
            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[1]);
            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[2]);
            await openedTabsHelper.assertTabIsBeingMoved(openedTabRowList[3]);
        });

        it('A click on "move below" should move the tab row below the clicked row when the former is lower than the latter', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage2Url);
        });

        it('A click on "move below" should move the tab row below the clicked row when the former is higher than the latter', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[2]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testPage2Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testFilter1Url);
        });

        it('A click on "move below" should move the tab to the right of the one associated to the clicked row', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[1]);

            const tabList = await browserInstructionSender.getAllTabs();
            assert.equal(controlCenterDesktopUrl, tabList[0].url);
            assert.equal(testPage1Url, tabList[1].url);
            assert.equal(testFilter1Url, tabList[2].url);
            assert.equal(testPage2Url, tabList[3].url);
        });

        it('A click on "move above others" should move the tab row at the first position', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnMoveAboveOthersButton();

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage2Url);
        });

        it('A click on "move above others" should move the tab at the first position', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnMoveAboveOthersButton();

            const tabList = await browserInstructionSender.getAllTabs();
            assert.equal(testFilter1Url, tabList[0].url);
            assert.equal(controlCenterDesktopUrl, tabList[1].url);
            assert.equal(testPage1Url, tabList[2].url);
            assert.equal(testPage2Url, tabList[3].url);
        });

        it('A click on the move cancel button should exit move mode without moving the tab', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);

            await openedTabsHelper.clickOnTabMoveCancelButton();

            const tabList = await browserInstructionSender.getAllTabs();
            assert.equal(controlCenterDesktopUrl, tabList[0].url);
            assert.equal(testPage1Url, tabList[1].url);
            assert.equal(testPage2Url, tabList[2].url);
            assert.equal(testFilter1Url, tabList[3].url);
        });

        it('A click on the selection move button should highlight selected tab rows', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();

            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[0]);
            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[1]);
            await openedTabsHelper.assertTabIsBeingMoved(openedTabRowList[2]);
            await openedTabsHelper.assertTabIsBeingMoved(openedTabRowList[3]);
        });

        it('A click on "move below" should move selected tab rows below the clicked row and keep their order', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[0]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testPage2Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage1Url);
        });

        it('A click on "move below" should move selected tab rows below the clicked row when they are higher than the clicked row', async () => {
            const testFilter2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_SOME_TEXT);
            const testFilter3Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_OTHER_TEXT);
            const testPage3Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITHOUT_FAVICON);
            await testHelper.openTab(testFilter2Url);
            await testHelper.openTab(testFilter3Url);
            await testHelper.openTab(testPage3Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[5]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[3]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage2Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[4], testFilter3Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[5], testFilter2Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[6], testPage3Url);
        });

        it('A click on "move below" should move selected tabs to the right of the one associated to the clicked row and keep their order', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[0]);

            const tabList = await browserInstructionSender.getAllTabs();
            assert.equal(controlCenterDesktopUrl, tabList[0].url);
            assert.equal(testPage2Url, tabList[1].url);
            assert.equal(testFilter1Url, tabList[2].url);
            assert.equal(testPage1Url, tabList[3].url);
        });

        it('A click on the "move above others" should move selected tab rows at the first position', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnMoveAboveOthersButton();

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], testPage2Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage1Url);
        });

        it('A click on the "move above others" should move selected tabs at the first position', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnMoveAboveOthersButton();

            const tabList = await browserInstructionSender.getAllTabs();
            assert.equal(testPage2Url, tabList[0].url);
            assert.equal(testFilter1Url, tabList[1].url);
            assert.equal(controlCenterDesktopUrl, tabList[2].url);
            assert.equal(testPage1Url, tabList[3].url);
        });

        it('A click on "move below" on one of the selected tabs should move selected tabs below it and keep their order', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage2Url);
        });

        it('A click on "move below" should do nothing when all tabs are selected', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.clickOnSelectionTabMoveButton();
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[2]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testPage2Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testFilter1Url);
        });

        it('A click on the title of a moved tab should focus its associated opened tab', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabTitle(newOpenedTabRowList[2]);

            const activeTab = await browserInstructionSender.getActiveTab();
            assert.equal(activeTab.index, 2);
        });

        it('Move mode should not be impacted when an opened tab is moved from the browser', async () => {
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);

            await testHelper.moveTab(3, 1);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveBelowButton(newOpenedTabRowList[2]);

            const newOpenedTabRowList2 = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList2[2], testFilter1Url);
        });
    });

    describe('Tab following', () => {
        let testPage1Url: string;
        let testPage2Url: string;
        let testFilter1Url: string;
        let testFilter2Url: string;
        let controlCenterDesktopUrl: string;

        beforeEach(async () => {
            testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            testFilter2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_SOME_TEXT);
            controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);

            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);
            await testHelper.openTab(testFilter2Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[4]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
        });

        it('A click on the tab move button should enable move mode', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);

            await followedTabsHelper.assertNoTabSelectorIsVisible();
            await followedTabsHelper.assertNoTabMoreButtonIsVisible();
            await followedTabsHelper.assertNoTabIndicatorIsVisible();
            await followedTabsHelper.assertMoveAboveOthersButtonIsVisible();
            await followedTabsHelper.assertTabMoveBelowButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabMoveBelowButtonIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabMoveBelowButtonIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertTabMoveBelowButtonIsVisible(followedTabRowList[3]);

            await testHelper.takeViewportScreenshot('followed-tabs-list-move-mode-enabled');
        });

        it('A click on the tab move button should highlight the tab row to move', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);

            await followedTabsHelper.assertTabIsNotBeingMoved(followedTabRowList[0]);
            await followedTabsHelper.assertTabIsNotBeingMoved(followedTabRowList[1]);
            await followedTabsHelper.assertTabIsNotBeingMoved(followedTabRowList[2]);
            await followedTabsHelper.assertTabIsBeingMoved(followedTabRowList[3]);
        });

        it('A click on "move below" should move the tab row below the clicked row when the former is lower than the latter', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[1]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);
        });

        it('A click on "move below" should move the tab row below the clicked row when the former is higher than the latter', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[2]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter2Url);
        });

        it('A click on "move above others" should move the tab row at the first position', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);
            await followedTabsHelper.clickOnMoveAboveOthersButton();

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);
        });

        it('A click on the move cancel button should exit move mode without moving the tab', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);

            await followedTabsHelper.clickOnTabMoveCancelButton();

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter2Url);
        });

        it('A click on the selection move button should highlight selected tab rows', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();

            await followedTabsHelper.assertTabIsNotBeingMoved(followedTabRowList[0]);
            await followedTabsHelper.assertTabIsNotBeingMoved(followedTabRowList[1]);
            await followedTabsHelper.assertTabIsBeingMoved(followedTabRowList[2]);
            await followedTabsHelper.assertTabIsBeingMoved(followedTabRowList[3]);
        });

        it('A click on "move below" should move selected tab rows below the clicked row and keep their order', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[0]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testPage2Url);
        });

        it('A click on "move below" should move selected tab rows below the clicked row when they are higher than the clicked row', async () => {
            const testFilter3Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_OTHER_TEXT);
            const testPage3Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITHOUT_FAVICON);
            const testPage4Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_WITH_NOT_FOUND_FAVICON);
            await testHelper.openTab(testFilter3Url);
            await testHelper.openTab(testPage3Url);
            await testHelper.openTab(testPage4Url);

            await testHelper.showOpenedTabsList();
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[7]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[6]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[5]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[5]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[3]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testFilter3Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage3Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testPage4Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[4], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[5], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[6], testFilter2Url);
        });

        it('A click on the "move above others" should move selected tab rows at the first position', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();
            await followedTabsHelper.clickOnMoveAboveOthersButton();

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testPage2Url);
        });

        it('A click on "move below" on one of the selected tabs should move selected tabs below it and keep their order', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[1]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);
        });

        it('A click on "move below" should do nothing when all tabs are selected', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[2]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter2Url);
        });

        it('A followed tab may be moved several times', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[0]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);

            await followedTabsHelper.clickOnTabMoveButton(newFollowedTabRowList[1]);
            await followedTabsHelper.clickOnTabMoveBelowButton(newFollowedTabRowList[2]);

            const newFollowedTabRowList2 = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[3], testFilter1Url);
        });

        it('Followed tabs may be moved one after another', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[1]);
            await followedTabsHelper.clickOnMoveAboveOthersButton();

            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[1]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);
        });

        it('A followed tab move should be kept at startup', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[1]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(controlCenterDesktopUrl, 0);
            await testHelper.switchToWindowHandle(0);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);
        });

        it('Followed tab selection move should be kept at startup', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.clickOnSelectionTabMoveButton();
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[0]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(controlCenterDesktopUrl, 0);
            await testHelper.switchToWindowHandle(0);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testPage2Url);
        });

        it('A followed tab moved several times should be at its final place at startup', async () => {
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabMoveButton(followedTabRowList[3]);
            await followedTabsHelper.clickOnTabMoveBelowButton(followedTabRowList[0]);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[1], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[2], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList[3], testFilter1Url);

            await followedTabsHelper.clickOnTabMoveButton(newFollowedTabRowList[1]);
            await followedTabsHelper.clickOnTabMoveBelowButton(newFollowedTabRowList[2]);

            await testHelper.reloadExtension();
            await testHelper.openIgnoredTab(controlCenterDesktopUrl, 0);
            await testHelper.switchToWindowHandle(0);

            await testHelper.showFollowedTabsList();
            const newFollowedTabRowList2 = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[0], testPage1Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[1], testPage2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[2], testFilter2Url);
            await followedTabsHelper.assertTabUrl(newFollowedTabRowList2[3], testFilter1Url);
        });
    });
});
