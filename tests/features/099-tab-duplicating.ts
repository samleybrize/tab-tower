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
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOenedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertNumberOfTabs(3);
            await openedTabsHelper.assertTabTitle(openedTabRowList[2], 'Test page 1');
            await openedTabsHelper.assertTabUrl(openedTabRowList[2], testPage1Url);
            await openedTabsHelper.assertTabFaviconUrl(openedTabRowList[2], firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));

            const tab = await browserInstructionSender.getTab(2);
            assert.equal(tab.title, 'Test page 1');
            assert.equal(tab.url, testPage1Url);
            assert.equal(tab.favIconUrl, firefoxConfig.getExtensionUrl(ExtensionUrl.FAVICON_1));

            // TODO dropdown screenshot
        });

        it('Clicking on the duplicate button should open a new tab at the last position', async () => {
            await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            const originalTabId = await openedTabRowList[1].getAttribute('data-tab-id');
            await openedTabsHelper.clickOnTabDuplicateButton(openedTabRowList[1]);

            const newOenedTabRowList = await openedTabsHelper.getTabRowList();
            const duplicateTabId = await openedTabRowList[1].getAttribute('data-tab-id');

            assert.notEqual(duplicateTabId, originalTabId);
        });
    });

    describe('Tab following', () => {
        xit('Duplicating a followed tab from the browser should open a new tab with the same properties', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a followed tab should open a new tab with the same properties', async () => {
            // TODO
        });

        xit('Duplicating a followed tab from the browser should not follow the new tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a followed tab should not follow the new tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a followed tab should open a new tab at the last position', async () => {
            // TODO
        });

        xit('A followed tab should not be duplicatable when its associated opened tab is closed', async () => {
            // TODO

            // TODO dropdown screenshot
        });

        xit('Clicking on the duplicate button of a followed tab at startup should not follow the new tab', async () => {
            // TODO
        });
    });

    describe('Reader mode', () => {
        xit('Duplicating a tab with reader mode enabled from the browser should open a new tab with reader mode enabled', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an opened tab with reader mode enabled should open a new tab with reader mode enabled', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a followed tab with reader mode enabled should open a new tab with reader mode enabled', async () => {
            // TODO
        });

        xit('Duplicating a tab with reader mode disabled from the browser should open a new tab with reader mode disabled', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an opened tab with reader mode disabled should open a new tab with reader mode disabled', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a followed tab with reader mode disabled should open a new tab with reader mode disabled', async () => {
            // TODO
        });
    });

    describe('Pinned tab', () => {
        xit('Duplicating a pinned tab from the browser should open a new pinned tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a pinned opened tab should open a new pinned tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a pinned followed tab should open a new pinned tab', async () => {
            // TODO
        });

        xit('Duplicating an unpinned tab from the browser should open a new unpinned tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an unpinned opened tab should open a new unpinned tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an unpinned followed tab should open a new unpinned tab', async () => {
            // TODO
        });
    });

    describe('Audible tabs', () => {
        xit('Duplicating an audible tab from the browser should open a new muted tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an audible opened tab should open a new audible tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an audible followed tab should open a new audible tab', async () => {
            // TODO
        });

        xit('Duplicating an inaudible tab from the browser should open a new muted tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an inaudible opened tab should open a new inaudible tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an inaudible followed tab should open a new inaudible tab', async () => {
            // TODO
        });
    });

    describe('Tab muting', () => {
        xit('Duplicating a muted tab from the browser should open a new muted tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a muted opened tab should open a new muted tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of a muted followed tab should open a new muted tab', async () => {
            // TODO
        });

        xit('Duplicating an unmuted tab from the browser should open a new unmuted tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an unmuted opened tab should open a new unmuted tab', async () => {
            // TODO
        });

        xit('Clicking on the duplicate button of an unmuted followed tab should open a new unmuted tab', async () => {
            // TODO
        });
    });
});
