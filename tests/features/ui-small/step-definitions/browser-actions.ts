import { Given, When } from 'cucumber';
import { WebDriver } from 'selenium-webdriver';

import { TestPageNames } from '../../../webdriver/test-page-descriptor';
import { World } from '../support/world';

Given('I use the small UI', {timeout: 20000}, async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const uiSmallDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SMALL);

    await webdriverHelper.resetBrowserState(uiSmallDescriptor.url);
});

Given('I use the settings UI', {timeout: 20000}, async function() {
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
    const webdriver = world.webdriverRetriever.getDriver();
    const uiSmallDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SMALL);

    await switchToTabWithUrl(webdriver, uiSmallDescriptor.url);
});

When('I focus the settings UI', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const uiSettingsDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SETTINGS);

    await switchToTabWithUrl(webdriver, uiSettingsDescriptor.url);
});

async function switchToTabWithUrl(webdriver: WebDriver, url: string) {
    const windowHandleList = await webdriver.getAllWindowHandles();

    for (const windowHandle of windowHandleList) {
        await webdriver.switchTo().window(windowHandle);

        if (url == await webdriver.getCurrentUrl()) {
            return;
        }
    }

    throw new Error(`Unable to find a tab with url "${url}"`);
}

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

    await webdriverHelper.executeScript(async (index: number, url: string) => {
        const tabToUpdate = await browser.tabs.query({index});

        if (tabToUpdate) {
            await browser.tabs.update(tabToUpdate[0].id, {url, active: false});
        }
    }, [tabPosition, newTestPageUrl]);
});

When('I reload the tab {int}', async function(tabPositionToReload: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabIdToReload = await webdriverHelper.executeScript(async (index: number) => {
        const tabToReload = await browser.tabs.query({index});

        if (tabToReload) {
            await browser.tabs.reload(tabToReload[0].id, {bypassCache: false});
        }

        return tabToReload[0].id;
    }, [tabPositionToReload]);

    await webdriver.wait(async () => {
        const tab = await webdriverHelper.executeScript(async (tabId: number) => {
            return browser.tabs.get(tabId);
        }, [tabIdToReload]);

        if (tab && 'complete' == tab.status) {
            return true;
        }
    }, 10000, `Tab at position "${tabPositionToReload}" is still loading`);
});

When('the tab {int} is not loading anymore', async function(tabPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    const tabId = await webdriverHelper.executeScript(async (index: number) => {
        const tab = await browser.tabs.query({index});

        return tab[0].id;
    }, [tabPosition]);

    await webdriverHelper.wait(async () => {
        const tab = await webdriverHelper.executeScript(async (id: number) => {
            return browser.tabs.get(id);
        }, [tabId]);

        if (tab && 'complete' == tab.status) {
            return true;
        }
    }, 10000, () => `Tab at position "${tabPosition}" is still loading`);
});

When('I focus the tab {int}', async function(tabPositionToFocus: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToFocus = await browser.tabs.query({index});

        if (tabToFocus) {
            await browser.tabs.update(tabToFocus[0].id, {active: true});
        }
    }, [tabPositionToFocus]);
});

When('I use the tab {int}', async function(tabPositionToFocus: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToFocus = await browser.tabs.query({index});

        if (tabToFocus) {
            await browser.tabs.update(tabToFocus[0].id, {active: true});
        }
    }, [tabPositionToFocus]);

    await webdriverHelper.switchToWindowHandle(tabPositionToFocus);
});

When('I close the tab {int}', async function(tabPositionToClose: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToClose = await browser.tabs.query({index});

        if (tabToClose) {
            await browser.tabs.remove(tabToClose[0].id);
        }
    }, [tabPositionToClose]);
});

When('I move the tab {int} to position {int}', async function(fromPosition: number, toPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (sourceIndex: number, targetIndex: number) => {
        const tabToMove = await browser.tabs.query({index: sourceIndex});

        if (tabToMove) {
            await browser.tabs.move(tabToMove[0].id, {index: targetIndex});
        }
    }, [fromPosition, toPosition]);
});

When('I mute the tab {int}', async function(tabPositionToMute: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToMute = await browser.tabs.query({index});

        if (tabToMute) {
            await browser.tabs.update(tabToMute[0].id, {muted: true});
        }
    }, [tabPositionToMute]);
});

When('I unmute the tab {int}', async function(tabPositionToUnmute: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToUnmute = await browser.tabs.query({index});

        if (tabToUnmute) {
            await browser.tabs.update(tabToUnmute[0].id, {muted: false});
        }
    }, [tabPositionToUnmute]);
});

When('I pin the tab {int}', async function(tabPositionToPin: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToPin = await browser.tabs.query({index});

        if (tabToPin) {
            await browser.tabs.update(tabToPin[0].id, {pinned: true});
        }
    }, [tabPositionToPin]);
});

When('I unpin the tab {int}', async function(tabPositionToUnpin: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToUnpin = await browser.tabs.query({index});

        if (tabToUnpin) {
            await browser.tabs.update(tabToUnpin[0].id, {pinned: false});
        }
    }, [tabPositionToUnpin]);
});

When('I duplicate the tab {int}', async function(tabPositionToDuplicate: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToDuplicate = await browser.tabs.query({index});

        if (tabToDuplicate) {
            await browser.tabs.duplicate(tabToDuplicate[0].id);
        }
    }, [tabPositionToDuplicate]);
});

When('I discard the tab {int}', async function(tabPositionToDuplicate: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (index: number) => {
        const tabToDiscard = await browser.tabs.query({index});

        if (tabToDiscard) {
            await browser.tabs.discard(tabToDiscard[0].id);
        }
    }, [tabPositionToDuplicate]);
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
