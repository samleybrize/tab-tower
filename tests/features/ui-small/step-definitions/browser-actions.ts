import { Given, When } from 'cucumber';
import { By, WebDriver } from 'selenium-webdriver';

import { TestPageNames } from '../../../webdriver/test-page-descriptor';
import { World } from '../support/world';

Given('I use the small UI', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const uiSmallDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SMALL);

    await webdriverHelper.resetBrowserState(uiSmallDescriptor.url);
});

Given('I use the settings UI', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const uiSettingsDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SETTINGS);

    await webdriverHelper.resetBrowserState(uiSettingsDescriptor.url);
});

Given('window height is {int}', async function(height: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (h: number) => {
        const window = await browser.windows.getCurrent();
        await browser.windows.update(window.id, {height: h});
    }, [height]);
});

When('I focus the small UI', async function() {
    const world = this as World;
    const uiSmallDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SMALL);

    await switchToTabWithUrl(world, uiSmallDescriptor.url);
});

When('I focus the settings UI', async function() {
    const world = this as World;
    const uiSettingsDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SETTINGS);

    await switchToTabWithUrl(world, uiSettingsDescriptor.url);
});

When('I open the small UI', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const uiSmallDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SMALL);

    await webdriverHelper.executeScript((url: string) => {
        browser.tabs.create({url, active: false});
    }, [uiSmallDescriptor.url]);
});

When('I open the settings UI', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const uiSettingsDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SETTINGS);

    await webdriverHelper.executeScript((url: string) => {
        browser.tabs.create({url, active: false});
    }, [uiSettingsDescriptor.url]);
});

When('I open the test page {string}', async function(testPageName: string) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const testPageDescriptorRetriever = world.testPageDescriptorRetriever;
    const testPageDescriptor = testPageDescriptorRetriever.getDescriptor(testPageName as TestPageNames);
    const testPageUrl = testPageDescriptor.url;

    await webdriverHelper.executeScript((url: string) => {
        browser.tabs.create({url, active: false});
    }, [testPageUrl]);
});

When('I open an empty tab', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(() => {
        browser.tabs.create({active: false});
    });
});

When('the tab {int} navigates to the test page {string}', async function(tabPosition: number, newTestPageName: string) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const testPageDescriptorRetriever = world.testPageDescriptorRetriever;
    const newTestPageDescriptor = testPageDescriptorRetriever.getDescriptor(newTestPageName as TestPageNames);
    const newTestPageUrl = newTestPageDescriptor.url;

    const tabId = await getTabIdFromIndex(world, tabPosition);
    await webdriverHelper.executeScript(async (id: number, url: string) => {
        await browser.tabs.update(id, {url, active: false});
    }, [tabId, newTestPageUrl]);
});

When('I reload the tab {int}', async function(tabPositionToReload: number) {
    await reloadTab(this as World, tabPositionToReload, false);
});

When('I reload the tab {int} with no cache', async function(tabPositionToReload: number) {
    await reloadTab(this as World, tabPositionToReload, true);
});

When('the tab {int} is not loading anymore', async function(tabPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPosition);
    await webdriverHelper.wait(async () => {
        return await isTabLoadingComplete(world, tabId);
    }, world.defaultWaitTimeout, () => `Tab at position "${tabPosition}" is still loading`);
});

When('I focus the tab {int}', async function(tabPositionToFocus: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToFocus);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.update(id, {active: true});
    }, [tabId]);
});

When('I use the tab {int}', async function(tabPositionToFocus: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToFocus);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.update(id, {active: true});
    }, [tabId]);

    await webdriverHelper.switchToWindowHandle(tabPositionToFocus);
});

When('I close the tab {int}', async function(tabPositionToClose: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToClose);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.remove(id);
    }, [tabId]);
});

When('I move the tab {int} to position {int}', async function(fromPosition: number, toPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, fromPosition);
    await webdriverHelper.executeScript(async (id: number, targetIndex: number) => {
        await browser.tabs.move(id, {index: targetIndex});
    }, [tabId, toPosition]);
});

When('I mute the tab {int}', async function(tabPositionToMute: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToMute);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.update(id, {muted: true});
    }, [tabId]);
});

When('I unmute the tab {int}', async function(tabPositionToUnmute: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToUnmute);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.update(id, {muted: false});
    }, [tabId]);
});

When('I pin the tab {int}', async function(tabPositionToPin: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToPin);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.update(id, {pinned: true});
    }, [tabId]);
});

When('I unpin the tab {int}', async function(tabPositionToUnpin: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToUnpin);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.update(id, {pinned: false});
    }, [tabId]);
});

When('I duplicate the tab {int}', async function(tabPositionToDuplicate: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToDuplicate);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.duplicate(id);
    }, [tabId]);
});

When('I discard the tab {int}', async function(tabPositionToDiscard: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await getTabIdFromIndex(world, tabPositionToDiscard);
    await webdriverHelper.executeScript(async (id: number) => {
        await browser.tabs.discard(id);
    }, [tabId]);
});

When('I restore the last recently closed tab', async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async () => {
        const recentlyClosedTabList = await browser.sessions.getRecentlyClosed({maxResults: 1});

        if (recentlyClosedTabList) {
            const sessionId = recentlyClosedTabList[0].tab.sessionId;
            await browser.sessions.restore(sessionId);
        }
    });
});

When('I click on the link {int}', async function(linkIndex: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const linkElements = await webdriver.findElements(By.css('a'));

    await linkElements[linkIndex].click();
});

async function switchToTabWithUrl(world: World, url: string) {
    const webdriver = world.webdriverRetriever.getDriver();
    await webdriver.wait(async () => {
        const windowHandleList = await webdriver.getAllWindowHandles();

        for (const windowHandle of windowHandleList) {
            await webdriver.switchTo().window(windowHandle);

            if (url == await webdriver.getCurrentUrl()) {
                return true;
            }
        }
    }, 10000, `Unable to find a tab with url "${url}"`);
}

async function reloadTab(world: World, tabPositionToReload: number, bypassCache: boolean) {
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabIdToReload = await getTabIdFromIndex(world, tabPositionToReload);
    await webdriverHelper.executeScript(async (id: number, reloadProperties: any) => {
        await browser.tabs.reload(id, reloadProperties);
    }, [tabIdToReload, {bypassCache}]);

    await webdriver.wait(async () => {
        return await isTabLoadingComplete(world, tabIdToReload);
    }, world.defaultWaitTimeout, `Tab at position "${tabPositionToReload}" is still loading`);
}

async function getTabIdFromIndex(world: World, tabIndex: number) {
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await webdriverHelper.executeScript(async (index: number) => {
        const tab = await browser.tabs.query({index});

        if (tab) {
            return tab[0].id;
        }
    }, [tabIndex]);

    if (null == tabId) {
        throw new Error(`Unable to find a browser tab at index ${tabIndex}`);
    }

    return tabId;
}

async function isTabLoadingComplete(world: World, tabId: number) {
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tab = await webdriverHelper.executeScript(async (id: number) => {
        return browser.tabs.get(id);
    }, [tabId]);

    return tab && 'complete' == tab.status;
}
