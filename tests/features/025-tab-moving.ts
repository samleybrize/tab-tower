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
        it('A click on the tab move button should enable move mode', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1));

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
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);

            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[0]);
            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[1]);
            await openedTabsHelper.assertTabIsNotBeingMoved(openedTabRowList[2]);
            await openedTabsHelper.assertTabIsBeingMoved(openedTabRowList[3]);
        });

        it('A click on "move below" should move the tab row below the clicked row', async () => {
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabMoveButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabMoveBelowButton(openedTabRowList[1]);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[0], controlCenterDesktopUrl);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[1], testPage1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[2], testFilter1Url);
            await openedTabsHelper.assertTabUrl(newOpenedTabRowList[3], testPage2Url);
        });

        it('A click on "move below" should move the tab to the right of the one associated to the clicked row', async () => {
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1));

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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

        it('A click on "move below" should move selected tabs to the right of the one associated to the clicked row and keep their order', async () => {
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
            const controlCenterDesktopUrl = firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP);
            const testPage1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1);
            const testPage2Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2);
            const testFilter1Url = firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1);
            await testHelper.openTab(testPage1Url);
            await testHelper.openTab(testPage2Url);
            await testHelper.openTab(testFilter1Url);

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
    });

    describe('Tab following', () => {
        xit('TODO', async () => {
            // TODO
        });
    });
});
