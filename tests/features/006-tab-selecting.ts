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

        it('Clicking on the title opened tab selector when it is off should check all opened tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnTitleTabSelector();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTitleTabSelectorIsChecked();
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsChecked(openedTabRowList[1]);

            await testHelper.takeViewportScreenshot('title-tab-selector-checked-open-list');
        });

        it('Clicking on the title opened tab selector when it is on should uncheck all opened tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnTitleTabSelector();
            await openedTabsHelper.clickOnTitleTabSelector();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTitleTabSelectorIsNotChecked();
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[0]);
            await openedTabsHelper.assertTabSelectorIsNotChecked(openedTabRowList[1]);
        });

        it('Unchecking all opened tab selectors when the title opened tab selector is on should uncheck the title opened tab selector', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnTitleTabSelector();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTitleTabSelectorIsNotChecked();
        });

        it('Checking an opened tab selector should reveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTitleMoreButtonIsVisible();
        });

        it('Unchecking all opened tab selectors should unreveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTitleMoreButtonIsNotVisible();
        });

        it('Unchecking an opened tab selector and leaving one on should not unreveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[0]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabSelector(openedTabRowList[1]);

            await openedTabsHelper.assertTitleMoreButtonIsVisible();
        });

        it('Checking the title opened tab selector should reveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnTitleTabSelector();

            await openedTabsHelper.assertTitleMoreButtonIsVisible();
        });

        it('Unchecking the title opened tab selector should unreveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await openedTabsHelper.clickOnTitleTabSelector();
            await openedTabsHelper.clickOnTitleTabSelector();

            await openedTabsHelper.assertTitleMoreButtonIsNotVisible();
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

        xit('Clicking on the title close button should close selected opened tabs', async () => {
            // TODO
            // TODO screenshot dropdown
        });

        xit('Clicking on the title follow button should follow selected opened tabs', async () => {
            // TODO
        });

        xit('Clicking on the title follow button should not follow selected unfollowable opened tabs', async () => {
            // TODO
        });

        xit('Clicking on the title unfollow button should unfollow selected opened tabs', async () => {
            // TODO
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

        it('Clicking on the title followed tab selector when it is off should check all followed tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTitleTabSelector();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTitleTabSelectorIsChecked();
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsChecked(followedTabRowList[1]);

            await testHelper.takeViewportScreenshot('title-tab-selector-checked-follow-list');
        });

        it('Clicking on the title followed tab selector when it is on should uncheck all followed tab selectors', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTitleTabSelector();
            await followedTabsHelper.clickOnTitleTabSelector();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTitleTabSelectorIsNotChecked();
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[0]);
            await followedTabsHelper.assertTabSelectorIsNotChecked(followedTabRowList[1]);
        });

        it('Unchecking all followed tab selectors when the title followed tab selector is on should uncheck the title followed tab selector', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTitleTabSelector();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[0]);
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertTitleTabSelectorIsNotChecked();
        });

        it('Checking a followed tab selector should reveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabSelector(followedTabRowList[1]);

            await followedTabsHelper.assertTitleMoreButtonIsVisible();
        });

        it('Unchecking all followed tab selectors should unreveal the title more button', async () => {
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

            await followedTabsHelper.assertTitleMoreButtonIsNotVisible();
        });

        it('Unchecking a followed tab selector and leaving one on should not unreveal the title more button', async () => {
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

            await followedTabsHelper.assertTitleMoreButtonIsVisible();
        });

        it('Checking the title followed tab selector should reveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTitleTabSelector();

            await followedTabsHelper.assertTitleMoreButtonIsVisible();
        });

        it('Unchecking the title followed tab selector should unreveal the title more button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_2));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);

            await testHelper.showFollowedTabsList();
            await followedTabsHelper.clickOnTitleTabSelector();
            await followedTabsHelper.clickOnTitleTabSelector();

            await followedTabsHelper.assertTitleMoreButtonIsNotVisible();
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

        xit('Clicking on the title close button should close selected followed tabs', async () => {
            // TODO
            // TODO screenshot dropdown
        });

        xit('Clicking on the title unfollow button should unfollow selected followed tabs', async () => {
            // TODO
        });
    });
});
