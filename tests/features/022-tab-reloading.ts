import { assert } from 'chai';
import { By, WebDriver } from 'selenium-webdriver';

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

describe('Tab reloading', () => {
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
        it('Opened tabs should be reloadable', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabReloadButtonIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabReloadButtonIsNotDisabled(openedTabRowList[0]);
            await openedTabsHelper.assertTabReloadButtonIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabReloadButtonIsNotDisabled(openedTabRowList[1]);

            await openedTabsHelper.clickOnTabMoreButton(openedTabRowList[0], true);
            await testHelper.takeViewportScreenshot('reload-button-visible-open-list');
        });

        it('Associated tab should be reloaded when clicked on the reload button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await testHelper.switchToWindowHandle(1);
            const pageRandomNumber = await driver.findElement(By.css('#id')).getText();
            await testHelper.switchToWindowHandle(0);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabReloadButton(1, openedTabRowList[1]);

            await testHelper.switchToWindowHandle(1);
            const pageNewRandomNumber = await driver.findElement(By.css('#id')).getText();
            assert.notEqual(pageNewRandomNumber, pageRandomNumber, 'Tab has not been reloaded');
        });
    });

    describe('Tab following', () => {
        it('Followed tabs should be reloadable', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReloadButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabReloadButtonIsNotDisabled(followedTabRowList[0]);

            await followedTabsHelper.clickOnTabMoreButton(followedTabRowList[0], true);
            await testHelper.takeViewportScreenshot('reload-button-visible-follow-list');
        });

        it('Associated opened tab should be reloaded when clicked on the reload button', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            await testHelper.switchToWindowHandle(1);
            const pageRandomNumber = await driver.findElement(By.css('#id')).getText();
            await testHelper.switchToWindowHandle(0);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.clickOnTabReloadButton(1, followedTabRowList[0]);

            await testHelper.switchToWindowHandle(1);
            const pageNewRandomNumber = await driver.findElement(By.css('#id')).getText();
            assert.notEqual(pageNewRandomNumber, pageRandomNumber, 'Tab has not been reloaded');
        });

        it('Reload button of a followed tab should be disabled when its associated opened tab is closed', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
            await openedTabsHelper.clickOnTabCloseButton(openedTabRowList[1]);

            await testHelper.showFollowedTabsList();
            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabReloadButtonIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabReloadButtonIsDisabled(followedTabRowList[0]);

            await followedTabsHelper.clickOnTabMoreButton(followedTabRowList[0], true);
            await testHelper.takeViewportScreenshot('reload-button-disabled-follow-list');
        });
    });
});
