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

describe('Tab selecting', () => {
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
        it('Clicking on an off opened tab selector should check it', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[1]);

            await testHelper.takeViewportScreenshot('tab-selector-checked-open-list');
        });

        it('Clicking on an on opened tab selector should uncheck it', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[1]);

            await testHelper.takeViewportScreenshot('tab-selector-unchecked-open-list');
        });

        it('Clicking on the general opened tab selector when it is off should check all opened tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnGeneralTabSelector();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertGeneralTabSelectorIsChecked();
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[1]);

            await testHelper.takeViewportScreenshot('title-tab-selector-checked-open-list');
        });

        it('Clicking on the general opened tab selector when it is on should uncheck all opened tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnGeneralTabSelector();
            await openedTabsHelper.clickOnGeneralTabSelector();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertGeneralTabSelectorIsNotChecked();
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[1]);
        });

        it('Unchecking all opened tab selectors when the general opened tab selector is on should uncheck the general opened tab selector', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnGeneralTabSelector();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertGeneralTabSelectorIsNotChecked();
        });

        it('Checking an opened tab selector should reveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertSelectionTabMoreButtonIsVisible();
        });

        it('Unchecking all opened tab selectors should unreveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertSelectionTabMoreButtonIsNotVisible();
        });

        it('Unchecking an opened tab selector and leaving one on should not unreveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertSelectionTabMoreButtonIsVisible();
        });

        it('Checking the general opened tab selector should reveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnGeneralTabSelector();

            await openedTabsHelper.assertSelectionTabMoreButtonIsVisible();
        });

        it('Unchecking the general opened tab selector should unreveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnGeneralTabSelector();
            await openedTabsHelper.clickOnGeneralTabSelector();

            await openedTabsHelper.assertSelectionTabMoreButtonIsNotVisible();
        });

        it('Clicking on an off opened tab selector with shift pressed should check selectors from it to the last clicked', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.shiftClickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[1]);
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[2]);
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[3]);
        });

        it('Clicking on an on opened tab selector with shift pressed should uncheck selectors from it to the last clicked', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[3]);

            await openedTabsHelper.shiftClickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[1]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[2]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[3]);
        });

        it('No opened tab selector should be checked at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await testHelper.reloadTab(0);

            const newOpenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabSelectorIsNotChecked(newOpenedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(newOpenedTabRowList[1]);
        });

        it('Clicking on the selection close button should close selected opened tabs', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnSelectionTabCloseButton();

            const openedTabList = await browserInstructionSender.getAllTabs();
            assert.equal(openedTabList.length, 1);
            assert.equal(openedTabList[0].url, firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));

            await openedTabsHelper.clickOnSelectionTabMoreButton(true);
            await testHelper.takeViewportScreenshot('title-more-dropdown-open-list');
        });

        it('Clicking on the selection follow button should follow selected opened tabs', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnSelectionTabFollowButton();

            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabFollowIndicatorIsOn(openedTabRowList[1]);
            await openedTabsHelper.assertTabFollowIndicatorIsOn(openedTabRowList[2]);
        });

        it('Clicking on the selection follow button should not follow selected unfollowable opened tabs', async () => {
            await testHelper.openTab();
            await testHelper.openTab();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnSelectionTabFollowButton();

            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[1]);
            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[2]);
        });

        it('Clicking on the selection unfollow button should unfollow selected opened tabs', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[2]);
            await openedTabsHelper.clickOnSelectionTabUnfollowButton();

            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[0]);
            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[1]);
            await openedTabsHelper.assertTabFollowIndicatorIsOff(openedTabRowList[2]);
        });
    });

    describe('Tab following', () => {
        it('Clicking on an off followed tab selector should check it', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[1]);

            await testHelper.takeViewportScreenshot('tab-selector-checked-follow-list');
        });

        it('Clicking on an on followed tab selector should uncheck it', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[1]);

            await testHelper.takeViewportScreenshot('tab-selector-unchecked-follow-list');
        });

        it('Clicking on the general followed tab selector when it is off should check all followed tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList(true);
            await followedTabsHelper.clickOnGeneralTabSelector();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertGeneralTabSelectorIsChecked();
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[1]);

            await testHelper.takeViewportScreenshot('title-tab-selector-checked-follow-list');
        });

        it('Clicking on the general followed tab selector when it is on should uncheck all followed tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList(true);
            await followedTabsHelper.clickOnGeneralTabSelector();
            await followedTabsHelper.clickOnGeneralTabSelector();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertGeneralTabSelectorIsNotChecked();
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[1]);
        });

        it('Unchecking all followed tab selectors when the general followed tab selector is on should uncheck the general followed tab selector', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList(true);
            await followedTabsHelper.clickOnGeneralTabSelector();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertGeneralTabSelectorIsNotChecked();
        });

        it('Checking a followed tab selector should reveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertSelectionTabMoreButtonIsVisible();
        });

        it('Unchecking all followed tab selectors should unreveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertSelectionTabMoreButtonIsNotVisible();
        });

        it('Unchecking a followed tab selector and leaving one on should not unreveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertSelectionTabMoreButtonIsVisible();
        });

        it('Checking the general followed tab selector should reveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList(true);
            await followedTabsHelper.clickOnGeneralTabSelector();

            await followedTabsHelper.assertSelectionTabMoreButtonIsVisible();
        });

        it('Unchecking the general followed tab selector should unreveal the selection more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList(true);
            await followedTabsHelper.clickOnGeneralTabSelector();
            await followedTabsHelper.clickOnGeneralTabSelector();

            await followedTabsHelper.assertSelectionTabMoreButtonIsNotVisible();
        });

        it('Clicking on an off followed tab selector with shift pressed should check selectors from it to the last clicked', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[4]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.shiftClickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[1]);
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[2]);
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[3]);
        });

        it('Clicking on an on followed tab selector with shift pressed should uncheck selectors from it to the last clicked', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[4]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[2]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[3]);

            await followedTabsHelper.shiftClickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[1]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[2]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[3]);
        });

        it('No followed tab selector should be checked at startup', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await testHelper.reloadTab(0);

            const newFollowedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabSelectorIsNotChecked(newFollowedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(newFollowedTabRowList[1]);
        });

        it('Clicking on the selection close button should close selected followed tabs', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnSelectionTabCloseButton();

            const openedTabList = await browserInstructionSender.getAllTabs();
            assert.equal(openedTabList.length, 1);
            assert.equal(openedTabList[0].url, firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));

            await followedTabsHelper.clickOnSelectionTabMoreButton(true);
            await testHelper.takeViewportScreenshot('title-more-dropdown-follow-list');
        });

        it('Clicking on the selection unfollow button should unfollow selected followed tabs', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);
            await followedTabsHelper.clickOnSelectionTabUnfollowButton();

            await followedTabsHelper.assertNumberOfTabs(0);
        });
    });
});
