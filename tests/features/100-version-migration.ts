import { assert } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../utils/browser-instruction-sender';
import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let browserInstructionSender: BrowserInstructionSender;
let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;

describe('Version migration', () => {
    before(async () => {
        testHelper = new TestHelper();
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

    it('Should migrate data model', async () => {
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));
        await browserInstructionSender.closeTab(0);
        await sleep(500);
        await testHelper.clearRecentlyClosedTabs();

        const storageObject = {
            'followState.c7fc0f60-2152-11e8-9489-654bbf4cc504': { title: 'Test page 1', isIncognito: false, isInReaderMode: false, isAudioMuted: false, url: 'https://test.page/1', faviconUrl: 'https://test.page/1/favicon.ico', openLongLivedId: 'a8951ea0-2152-11e8-9489-654bbf4cc504', openLastAccess: '2018-03-06T15:26:29.503Z', id: 'c7fc0f60-2152-11e8-9489-654bbf4cc504' },
            'followState.c7fe3240-2152-11e8-9489-654bbf4cc504': { title: 'Test page 2', isIncognito: false, isInReaderMode: false, isAudioMuted: false, url: 'https://test.page/2', faviconUrl: 'https://test.page/2/favicon.ico', openLongLivedId: 'bc104d60-2152-11e8-9489-654bbf4cc504', openLastAccess: '2018-03-06T15:26:25.974Z', id: 'c7fe3240-2152-11e8-9489-654bbf4cc504' },
        };
        await browserInstructionSender.clearWebStorage();
        await browserInstructionSender.setToWebStorage(storageObject);

        await testHelper.reloadExtension();
        await sleep(1000);

        const webStorageContent = await browserInstructionSender.getWebStorageContent();
        const expectedWebStorageContent = {
            'version': '0.3.0',
            'nativeRecentlyClosedTabs': [] as any,
            'followState.c7fc0f60-2152-11e8-9489-654bbf4cc504': { title: 'Test page 1', isIncognito: false, isInReaderMode: false, isAudioMuted: false, url: 'https://test.page/1', faviconUrl: 'https://test.page/1/favicon.ico', openLongLivedId: 'a8951ea0-2152-11e8-9489-654bbf4cc504', openLastAccess: '2018-03-06T15:26:29.503Z', id: 'c7fc0f60-2152-11e8-9489-654bbf4cc504', weight: -3002399751580330 },
            'followState.c7fe3240-2152-11e8-9489-654bbf4cc504': { title: 'Test page 2', isIncognito: false, isInReaderMode: false, isAudioMuted: false, url: 'https://test.page/2', faviconUrl: 'https://test.page/2/favicon.ico', openLongLivedId: 'bc104d60-2152-11e8-9489-654bbf4cc504', openLastAccess: '2018-03-06T15:26:25.974Z', id: 'c7fe3240-2152-11e8-9489-654bbf4cc504', weight: 3002399751580331 },
        };

        assert.deepEqual(webStorageContent, expectedWebStorageContent);
    });
});
