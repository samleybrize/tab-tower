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

describe('Tab reloading', () => {
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
        xit('Opened tabs should be mutable', async () => {
            // TODO
        });

        xit('Opened tabs audio mute indicator should be on when its associated tab is muted from the browser', async () => {
            // TODO
        });

        xit('Opened tabs audio mute indicator should be on when its associated tab is muted from the mute button', async () => {
            // TODO
        });

        xit('Opened tabs audio mute indicator should be off when its associated tab is unmuted from the browser', async () => {
            // TODO
        });

        xit('Opened tabs audio mute indicator should be off when its associated tab is unmuted from the mute button', async () => {
            // TODO
        });

        xit('Should show muted opened tabs with mute indicator enabled at startup', async () => {
            // TODO
        });
    });

    describe('Tab following', () => {
        xit('Followed tabs should be mutable', async () => {
            // TODO
        });

        xit('Followed tabs audio mute indicator should be on when its associated tab is muted from the browser', async () => {
            // TODO
        });

        xit('Followed tabs audio mute indicator should be on when its associated tab is muted from the mute button', async () => {
            // TODO
        });

        xit('Followed tabs audio mute indicator should be off when its associated tab is unmuted from the browser', async () => {
            // TODO
        });

        xit('Followed tabs audio mute indicator should be off when its associated tab is unmuted from the mute button', async () => {
            // TODO
        });

        xit('A followed tab should be restored with sound muted when it was so', async () => {
            // TODO
        });

        xit('Mute indicator should be on when restoring a muted tab', async () => {
            // TODO
        });

        xit('Mute indicator should be off when restoring an unmuted tab', async () => {
            // TODO
        });

        xit('Unmute button should be visible when restoring a muted tab', async () => {
            // TODO
        });

        xit('Mute button should be visible when restoring an unmuted tab', async () => {
            // TODO
        });

        xit('Should show followed tabs associated to muted opened tabs with mute indicator enabled at startup', async () => {
            // TODO
        });
    });

    describe('Browser recently closed tabs', () => {
        xit('A followed tab should be restored with sound muted when it was so', async () => {
            // TODO
        });

        xit('Mute indicator should be on when restoring a muted tab', async () => {
            // TODO
        });

        xit('Mute indicator should be off when restoring an unmuted tab', async () => {
            // TODO
        });

        xit('Unmute button should be visible when restoring a muted tab', async () => {
            // TODO
        });

        xit('Mute button should be visible when restoring an unmuted tab', async () => {
            // TODO
        });
    });
});
