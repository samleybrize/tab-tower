import { Given, When } from 'cucumber';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';
import { TestPageNames } from '../../../webdriver/test-page-descriptor';
import { World } from '../support/world';

Given('I use the small UI', {timeout: 20000}, async function() {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const uiSmallDescriptor = world.testPageDescriptorRetriever.getDescriptor(TestPageNames.UI_SMALL);

    await webdriverHelper.resetBrowserState(uiSmallDescriptor.url);
});

Given('window height is {int}', async function(height: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    await webdriverHelper.executeScript(async (h: number) => {
        const window = await browser.windows.getCurrent();
        await browser.windows.update(window.id, {height: h});
    }, [height]);
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
    }, 3000, `Tab at position "${tabPositionToReload}" is still loading`);
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
    }, 3000, () => `Tab at position "${tabPosition}" is still loading`);
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

When('I type {string} in the tab filter input', async function(filterText: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-list .filter input.filter-input'));
    await inputElement.sendKeys(filterText);
});

When('I delete all characters in the tab filter input', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-list .filter input.filter-input'));
    await inputElement.clear();
});

When('I click on the close button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const closeButton = tab.findElement(By.css('.close-button'));
    await clickElementOnceAvailable(
        webdriver,
        closeButton,
        `Close button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click on the mute button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const muteButton = tab.findElement(By.css('.audible-icon'));
    await clickElementOnceAvailable(
        webdriver,
        muteButton,
        `Mute button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click on the unmute button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const unmuteButton = tab.findElement(By.css('.muted-icon'));
    await clickElementOnceAvailable(
        webdriver,
        unmuteButton,
        `Unmute button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click on the title of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const titleContainer = tab.findElement(By.css('.title-container'));
    await clickElementOnceAvailable(
        webdriver,
        titleContainer,
        `Title of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

// TODO
async function getTabAtPosition(webdriver: WebDriver, workspaceId: string, tabPosition: number) {
    let excludePinnedSelector = '';

    if ('pinned-tabs' != workspaceId) {
        excludePinnedSelector = ':not(.pinned)';
    }

    const tabList = await webdriver.findElements(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .tab:not(.hide)${excludePinnedSelector}`));

    return tabList[tabPosition];
}

async function clickElementOnceAvailable(webdriver: WebDriver, element: WebElement, failMessage: string) {
    webdriver.wait(async () => {
        try {
            await element.click();

            return true;
        } catch (error) {
            if (error instanceof WebDriverError.ElementClickInterceptedError) {
                return false;
            }
        }
    }, 10000, failMessage);
}
