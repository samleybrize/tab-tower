import { assert } from 'chai';
import { By, until, WebDriver } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../utils/browser-instruction-sender';
import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { FollowedTabsTestHelper } from '../webdriver/test-helper/followed-tabs-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { TabFilterTestHelper } from '../webdriver/test-helper/tab-filter-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let browserInstructionSender: BrowserInstructionSender;
let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let followedTabsHelper: FollowedTabsTestHelper;
let openedTabsHelper: OpenedTabsTestHelper;
let tabFilterHelper: TabFilterTestHelper;

describe('Tab filter', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        tabFilterHelper = testHelper.getTabFilterHelper();
        browserInstructionSender = testHelper.getBrowserInstructionSender();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.UI));

        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_SOME_TEXT));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_OTHER_TEXT));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[1]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnFollowButton(openedTabRowList[3]);
    });
    after(async () => {
        await testHelper.shutdown();
    });
    afterEach(async () => {
        await tabFilterHelper.clearInput();
        await tabFilterHelper.focusInput();
    });

    describe('Opened tabs', () => {
        it('Should filter opened tabs by title on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('azerty');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter opened tabs by title on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('azerty qwerty');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter opened tabs by url on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('some');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter opened tabs by url on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('some other');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should show the no tab row in opened tabs list when the filter do not match any tab', async () => {
            await tabFilterHelper.sendTextToInput('unknown');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsVisible();
        });

        it('Should disable filter when clearing the input', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clearInput();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should do nothing when clicking on the reset button while the input is empty', async () => {
            await tabFilterHelper.clickOnResetButton();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should disable filter when the reset button is clicked', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clickOnResetButton();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter at startup when the input is not empty', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await testHelper.reloadTab(0);

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();
        });
    });

    describe('Followed tabs', () => {
        before(async () => {
            await testHelper.showFollowedTabsList();
        });

        it('Should filter followed tabs by title on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('azerty');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter followed tabs by title on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('azerty qwerty');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter followed tabs by url on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('some');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter followed tabs by url on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('some other');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should show the no tab row in followed tabs list when the filter do not match any tab', async () => {
            await tabFilterHelper.sendTextToInput('unknown');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsVisible();
        });

        it('Should disable filter when clearing the input', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clearInput();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should do nothing when clicking on the reset button while the input is empty', async () => {
            await tabFilterHelper.clickOnResetButton();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should disable filter when the reset button is clicked', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clickOnResetButton();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });

        it('Should filter at startup when the input is not empty', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await testHelper.reloadTab(0);
            await testHelper.showFollowedTabsList();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();
        });
    });

    describe('Screenshots', () => {
        it('State of the filter block when empty, non focused', async () => {
            await tabFilterHelper.blurInput();

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-initial-state');
        });

        it('State of the filter block when empty, focused', async () => {
            await tabFilterHelper.focusInput();

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-focus-state');
        });

        it('State of the filter block when non empty, focused', async () => {
            await tabFilterHelper.sendTextToInput('some text');

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-focus-state-with-text');
        });

        it('State of the filter block when non empty, non focused', async () => {
            await tabFilterHelper.sendTextToInput('some text');
            await tabFilterHelper.blurInput();

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-initial-state-with-text');
        });

        it('State of the filter block when clicking on the reset button while the input is empty', async () => {
            await tabFilterHelper.clickOnResetButton();

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-reset-when-empty');
        });

        it('State of the filter block when clicking on the reset button while the input is not empty', async () => {
            await tabFilterHelper.sendTextToInput('some text');
            await tabFilterHelper.clickOnResetButton();

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-reset-when-not-empty');
        });

        it('State of the filter block at startup when the input is not empty', async () => {
            await tabFilterHelper.sendTextToInput('some text');
            await testHelper.reloadTab(0);

            await tabFilterHelper.takeHeaderScreenshot('tab-filter-at-startup-when-not-empty');
        });
    });
});
