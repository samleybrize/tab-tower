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
        xit('Opened tabs audible indicator should be on when its associated tab is playing a sound', async () => {
            // TODO
        });

        xit('Opened tabs audible indicator should be off when its associated tab is not playing a sound anymore', async () => {
            // TODO
        });

        xit('Opened tabs audible indicator should be on when its associated tab is playing a sound again', async () => {
            // TODO
        });

        xit('Mute button should be visible on the opened tabs list when unmuted', async () => {
            // TODO
        });

        xit('Unmute button should be visible on the opened tabs list when muted', async () => {
            // TODO
        });

        xit('Should show audible opened tabs with audible indicator enabled at startup', async () => {
            // TODO
        });
    });

    describe('Tab following', () => {
        xit('Followed tabs audible indicator should be on when its associated tab is playing a sound', async () => {
            // TODO
        });

        xit('Followed tabs audible indicator should be off when its associated tab is not playing a sound anymore', async () => {
            // TODO
        });

        xit('Followed tabs audible indicator should be on when its associated tab is playing a sound again', async () => {
            // TODO
        });

        xit('Followed tabs audible indicator should be off when its associated tab is closed', async () => {
            // TODO
        });

        xit('Mute button should be visible on the followed tabs list when its associated opened tab is unmuted', async () => {
            // TODO
        });

        xit('Unmute button should be visible on the followed tabs list when its associated opened tab is muted', async () => {
            // TODO
        });

        xit('Should show followed tabs associated to audible opened tabs with audible indicator enabled at startup', async () => {
            // TODO
        });
    });

    describe('Browser recently closed tabs', () => {
        xit('Should update associated opened tab audible indicator when a recently closed tab is restored from the browser', async () => {
            // TODO
        });

        xit('Should update associated followed tab audible indicator when a recently closed tab is restored from the browser', async () => {
            // TODO
        });
    });
});
