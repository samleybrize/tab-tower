import { WebDriver } from 'selenium-webdriver';

import { ExtensionUrl } from '../utils/extension-url';
import { FirefoxConfig } from '../webdriver/firefox-config';
import { FollowedTabsTestHelper } from '../webdriver/test-helper/followed-tabs-test-helper';
import { OpenedTabsTestHelper } from '../webdriver/test-helper/opened-tabs-test-helper';
import { RecentlyUnfollowedTabsTestHelper } from '../webdriver/test-helper/recently-unfollowed-tabs-test-helper';
import { TabFilterTestHelper } from '../webdriver/test-helper/tab-filter-test-helper';
import { TestHelper } from '../webdriver/test-helper/test-helper';

let driver: WebDriver;
let firefoxConfig: FirefoxConfig;
let testHelper: TestHelper;
let followedTabsHelper: FollowedTabsTestHelper;
let openedTabsHelper: OpenedTabsTestHelper;
let recentlyUnfollowedTabsHelper: RecentlyUnfollowedTabsTestHelper;
let tabFilterHelper: TabFilterTestHelper;

describe('Tab filter', () => {
    before(async () => {
        testHelper = new TestHelper();
        followedTabsHelper = testHelper.getFollowedTabsHelper();
        openedTabsHelper = testHelper.getOpenedTabsHelper();
        recentlyUnfollowedTabsHelper = testHelper.getRecentlyUnfollowedTabsHelper();
        tabFilterHelper = testHelper.getTabFilterHelper();
        driver = testHelper.getDriver();
        firefoxConfig = testHelper.getFirefoxConfig();

        await driver.get(firefoxConfig.getExtensionUrl(ExtensionUrl.CONTROL_CENTER_DESKTOP));

        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_1));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_SOME_TEXT));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_FILTER_WITH_OTHER_TEXT));
        await testHelper.openTab(firefoxConfig.getExtensionUrl(ExtensionUrl.TEST_PAGE_1));

        const openedTabRowList = await openedTabsHelper.getTabRowList();
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[3]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[2]);
        await openedTabsHelper.clickOnTabFollowButton(openedTabRowList[1]);
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

            await openedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await openedTabsHelper.assertNumberOfTabsIsNotVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsVisible();
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

            await openedTabsHelper.assertShownNumberOfVisibleTabs('2');
            await openedTabsHelper.assertNumberOfTabsIsNotVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsVisible();
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

            await openedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await openedTabsHelper.assertNumberOfTabsIsNotVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsVisible();
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

            await openedTabsHelper.assertShownNumberOfVisibleTabs('2');
            await openedTabsHelper.assertNumberOfTabsIsNotVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter opened tabs by url with protocol ignored', async () => {
            await tabFilterHelper.sendTextToInput('moz-extension');

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsNotVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsVisible();
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

            await openedTabsHelper.assertShownNumberOfVisibleTabs('0');
            await openedTabsHelper.assertNumberOfTabsIsNotVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsVisible();
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

            await openedTabsHelper.assertShownNumberOfTabs('5');
            await openedTabsHelper.assertNumberOfTabsIsVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
        });

        it('Should do nothing when clicking on the reset button while the input is empty', async () => {
            await tabFilterHelper.focusInput();
            await tabFilterHelper.clickOnResetButton();

            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[0]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[1]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[2]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[3]);
            await openedTabsHelper.assertTabRowIsVisible(openedTabRowList[4]);
            await openedTabsHelper.assertNoTabRowIsNotVisible();

            await openedTabsHelper.assertShownNumberOfTabs('5');
            await openedTabsHelper.assertNumberOfTabsIsVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
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

            await openedTabsHelper.assertShownNumberOfTabs('5');
            await openedTabsHelper.assertNumberOfTabsIsVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
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

            await openedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await openedTabsHelper.assertNumberOfTabsIsNotVisible();
            await openedTabsHelper.assertNumberOfVisibleTabsIsVisible();
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

            await followedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await followedTabsHelper.assertNumberOfTabsIsNotVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter followed tabs by title on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('azerty qwerty');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();

            await followedTabsHelper.assertShownNumberOfVisibleTabs('2');
            await followedTabsHelper.assertNumberOfTabsIsNotVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter followed tabs by url on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('some');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();

            await followedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await followedTabsHelper.assertNumberOfTabsIsNotVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter followed tabs by url on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('some other');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();

            await followedTabsHelper.assertShownNumberOfVisibleTabs('2');
            await followedTabsHelper.assertNumberOfTabsIsNotVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter followed tabs by url with protocol ignored', async () => {
            await tabFilterHelper.sendTextToInput('moz-extension');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsVisible();
        });

        it('Should show the no tab row in followed tabs list when the filter do not match any tab', async () => {
            await tabFilterHelper.sendTextToInput('unknown');

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsNotVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsVisible();

            await followedTabsHelper.assertShownNumberOfVisibleTabs('0');
            await followedTabsHelper.assertNumberOfTabsIsNotVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should disable filter when clearing the input', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clearInput();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();

            await followedTabsHelper.assertShownNumberOfTabs('3');
            await followedTabsHelper.assertNumberOfTabsIsVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
        });

        it('Should do nothing when clicking on the reset button while the input is empty', async () => {
            await tabFilterHelper.focusInput();
            await tabFilterHelper.clickOnResetButton();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();

            await followedTabsHelper.assertShownNumberOfTabs('3');
            await followedTabsHelper.assertNumberOfTabsIsVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
        });

        it('Should disable filter when the reset button is clicked', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clickOnResetButton();

            const followedTabRowList = await followedTabsHelper.getTabRowList();
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[0]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[1]);
            await followedTabsHelper.assertTabRowIsVisible(followedTabRowList[2]);
            await followedTabsHelper.assertNoTabRowIsNotVisible();

            await followedTabsHelper.assertShownNumberOfTabs('3');
            await followedTabsHelper.assertNumberOfTabsIsVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
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

            await followedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await followedTabsHelper.assertNumberOfTabsIsNotVisible();
            await followedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });
    });

    describe('Recently unfollowed tabs', () => {
        before(async () => {
            await testHelper.showOpenedTabsList();
            const openedTabRowList = await openedTabsHelper.getTabRowList();
            await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[3]);
            await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[2]);
            await openedTabsHelper.clickOnTabUnfollowButton(openedTabRowList[1]);

            await testHelper.showRecentlyUnfollowedTabsList();
        });

        it('Should filter recently unfollowed tabs by title on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('azerty');

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsNotVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter recently unfollowed tabs by title on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('azerty qwerty');

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfVisibleTabs('2');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsNotVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter recently unfollowed tabs by url on input with one word', async () => {
            await tabFilterHelper.sendTextToInput('some');

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsNotVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter recently unfollowed tabs by url on input with two word', async () => {
            await tabFilterHelper.sendTextToInput('some other');

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfVisibleTabs('2');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsNotVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should filter recently unfollowed tabs by url with protocol ignored', async () => {
            await tabFilterHelper.sendTextToInput('moz-extension');

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsVisible();
        });

        it('Should show the no tab row in recently unfollowed tabs list when the filter do not match any tab', async () => {
            await tabFilterHelper.sendTextToInput('unknown');

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfVisibleTabs('0');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsNotVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsVisible();
        });

        it('Should disable filter when clearing the input', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clearInput();

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfTabs('3');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
        });

        it('Should do nothing when clicking on the reset button while the input is empty', async () => {
            await tabFilterHelper.focusInput();
            await tabFilterHelper.clickOnResetButton();

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfTabs('3');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
        });

        it('Should disable filter when the reset button is clicked', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await tabFilterHelper.clickOnResetButton();

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfTabs('3');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsNotVisible();
        });

        it('Should filter at startup when the input is not empty', async () => {
            await tabFilterHelper.sendTextToInput('some');
            await testHelper.reloadTab(0);
            await testHelper.showRecentlyUnfollowedTabsList();

            const recentlyUnfollowedTabRowList = await recentlyUnfollowedTabsHelper.getTabRowList();
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[0]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsVisible(recentlyUnfollowedTabRowList[1]);
            await recentlyUnfollowedTabsHelper.assertTabRowIsNotVisible(recentlyUnfollowedTabRowList[2]);
            await recentlyUnfollowedTabsHelper.assertNoTabRowIsNotVisible();

            await recentlyUnfollowedTabsHelper.assertShownNumberOfVisibleTabs('1');
            await recentlyUnfollowedTabsHelper.assertNumberOfTabsIsNotVisible();
            await recentlyUnfollowedTabsHelper.assertNumberOfVisibleTabsIsVisible();
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
