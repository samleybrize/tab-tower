import { Then } from 'cucumber';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';
import { sleep } from '../../../../src/typescript/utils/sleep';
import { TestPageNames } from '../../../webdriver/test-page-descriptor';
import { WebdriverHelper } from '../../../webdriver/webdriver-helper';
import { World } from '../support/world';

Then("I should see the browser's tab {int} as focused", async function(expectedFocusedTabPosition: number) {
    const world = this as World;
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();

    let actualFocusedTabPosition: number;
    await webdriverHelper.wait(async () => {
        actualFocusedTabPosition = await webdriverHelper.executeScript(async () => {
            const activeTabList = await browser.tabs.query({active: true});

            return activeTabList ? activeTabList[0].index : null;
        });

        return actualFocusedTabPosition === expectedFocusedTabPosition;
    }, 10000, () => `Actual focused tab position "${actualFocusedTabPosition}" is different than expected "${expectedFocusedTabPosition}"`);
});

Then('I should see {int} visible tab(s) on the workspace {string}', async function(expectedNumberOfTabs: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    await TabAssertions.assertNumberOfVisibleTabs(webdriver, webdriverHelper, workspaceId, expectedNumberOfTabs);
});

Then('I should see that no tab matches tab search on the workspace {string}', async function(workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await TabAssertions.assertNoTabMatchesTabSearchIsVisible(webdriver, workspaceId);
});

Then('I should not see that no tab matches tab search on the workspace {string}', async function(workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await TabAssertions.assertNoTabMatchesTabSearchIsNotVisible(webdriver, workspaceId);
});

Then('I should see the small UI as tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTab(world, workspaceId, tabPosition, TestPageNames.UI_SMALL);
});

Then('I should see the test page {string} as tab {int} on the workspace {string}', async function(expectedTestPageName: string, tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTab(world, workspaceId, tabPosition, expectedTestPageName);
});

Then('I should not see the tab {int} as audible on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabAudibleIconIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as audible on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabAudibleIconIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the tab {int} as muted on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabMutedIconIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as muted on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabMutedIconIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the tab {int} as focused on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsNotMarkedAsFocused(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as focused on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsMarkedAsFocused(world, workspaceId, tabPosition);
});

Then('I should not see the tab {int} as loading on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsNotMarkedAsLoading(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as loading on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsMarkedAsLoading(world, workspaceId, tabPosition);
});

Then('there should not be a visible close button on the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertCloseButtonIsNotVisible(world, workspaceId, tabPosition);
});

class TabAssertions {
    static async assertNumberOfVisibleTabs(webdriver: WebDriver, webdriverHelper: WebdriverHelper, workspaceId: string, expectedNumberOfTabs: number) {
        let actualNumberOfTabs = 0;
        await webdriverHelper.wait(async () => {
            const tabList = await webdriver.findElements(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .tab`));
            actualNumberOfTabs = 0;

            for (const tab of tabList) {
                try {
                    if (await tab.isDisplayed()) {
                        actualNumberOfTabs++;
                    }
                } catch (error) {
                    if (!(error instanceof WebDriverError.StaleElementReferenceError)) {
                        throw error;
                    }
                }
            }

            return expectedNumberOfTabs == actualNumberOfTabs;
        }, 10000, () => `Number of visible tabs on workspace "${workspaceId}" is "${actualNumberOfTabs}" but "${expectedNumberOfTabs}" were expected`);
    }

    static async assertNoTabMatchesTabSearchIsVisible(webdriver: WebDriver, workspaceId: string) {
        const noTabMatchesSearchElement = webdriver.findElement(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .no-tab-matches-search`));
        await webdriver.wait(async () => {
            return await noTabMatchesSearchElement.isDisplayed();
        }, 10000, 'The no tab matches tab search message is not visible');
    }

    static async assertNoTabMatchesTabSearchIsNotVisible(webdriver: WebDriver, workspaceId: string) {
        const noTabMatchesSearchElement = webdriver.findElement(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .no-tab-matches-search`));
        await webdriver.wait(async () => {
            return !await noTabMatchesSearchElement.isDisplayed();
        }, 10000, 'The no tab matches tab search message is visible');
    }

    static async assertTab(world: World, workspaceId: string, tabPosition: number, expectedTestPageName: string) {
        const webdriver = world.webdriverRetriever.getDriver();
        const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
        const testPageDescriptor = world.testPageDescriptorRetriever.getDescriptor(expectedTestPageName as TestPageNames);

        let tab: WebElement;
        const expectedTitle = testPageDescriptor.title;
        await webdriverHelper.wait(async () => {
            tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

            return this.isTabTitleEqualTo(tab, expectedTitle);
        }, 10000, async () => {
            const actualTitle = await this.getTabTitle(tab);

            return `Tab title "${actualTitle}" is different than expected "${expectedTitle}"`;
        });

        await this.assertTabUrl(webdriver, webdriverHelper, tab, testPageDescriptor.url);
        await this.assertTabDomain(webdriver, webdriverHelper, tab, testPageDescriptor.domain);
        await this.assertTabFavicon(webdriverHelper, tab, testPageDescriptor.faviconUrl);
    }

    private static async getTabAtPosition(webdriver: WebDriver, workspaceId: string, tabPosition: number) {
        let excludePinnedSelector = '';

        if ('pinned-tabs' != workspaceId) {
            excludePinnedSelector = ':not(.pinned)';
        }

        const tabList = await webdriver.findElements(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .tab:not(.hide)${excludePinnedSelector}`));

        return tabList[tabPosition];
    }

    private static async isTabTitleEqualTo(tab: WebElement, expectedTitle: string) {
        const actualTitle = await this.getTabTitle(tab);

        return expectedTitle == actualTitle;
    }

    private static async getTabTitle(tab: WebElement) {
        const titleElement = tab.findElement(By.css('.title'));
        const tabTitle = await titleElement.getText();

        return tabTitle;
    }

    private static async assertTabUrl(webdriver: WebDriver, webdriverHelper: WebdriverHelper, tab: WebElement, expectedUrl: string) {
        const tabElementId = await tab.getAttribute('id');
        let actualUrl: string;
        await webdriverHelper.wait(async () => {
            actualUrl = await webdriver.executeScript((elementId: string) => {
                return document.querySelector(`#${elementId} .url`).textContent;
            }, tabElementId) as string;

            return expectedUrl == actualUrl;
        }, 10000, () => `Tab url "${actualUrl}" is different than expected "${expectedUrl}"`);
    }

    private static async assertTabDomain(webdriver: WebDriver, webdriverHelper: WebdriverHelper, tab: WebElement, expectedDomain: string) {
        const tabElementId = await tab.getAttribute('id');
        let actualDomain: string;
        await webdriverHelper.wait(async () => {
            actualDomain = await webdriver.executeScript((elementId: string) => {
                return document.querySelector(`#${elementId} .domain`).textContent;
            }, tabElementId) as string;

            return expectedDomain == actualDomain;
        }, 10000, () => `Tab domain "${actualDomain}" is different than expected "${expectedDomain}"`);
    }

    private static async assertTabFavicon(webdriverHelper: WebdriverHelper, tab: WebElement, expectedFaviconUrl: string) {
        let actualFaviconUrl: string;
        const faviconElement = tab.findElement(By.css('.favicon img'));
        await webdriverHelper.wait(async () => {
            actualFaviconUrl = await faviconElement.getAttribute('src');

            return expectedFaviconUrl == actualFaviconUrl;
        }, 10000, () => `Tab favicon url "${actualFaviconUrl}" is different than expected "${expectedFaviconUrl}"`);
    }

    static async assertTabAudibleIconIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const audibleElement = tab.findElement(By.css('.audible-icon'));

        await webdriver.wait(async () => {
            return await audibleElement.isDisplayed();
        }, 10000, 'Tab audible icon is not visible');
    }

    static async assertTabAudibleIconIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const audibleElement = tab.findElement(By.css('.audible-icon'));

        await webdriver.wait(async () => {
            return !await audibleElement.isDisplayed();
        }, 10000, 'Tab audible icon is visible');
    }

    static async assertTabMutedIconIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const mutedElement = tab.findElement(By.css('.muted-icon'));

        await webdriver.wait(async () => {
            return await mutedElement.isDisplayed();
        }, 10000, 'Tab muted icon is not visible');
    }

    static async assertTabMutedIconIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const mutedElement = tab.findElement(By.css('.muted-icon'));

        await webdriver.wait(async () => {
            return !await mutedElement.isDisplayed();
        }, 10000, 'Tab muted icon is visible');
    }

    static async assertTabIsMarkedAsFocused(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return await this.hasCssClass(tab, 'active');
        }, 10000, 'Tab is not marked as focused');
    }

    private static async hasCssClass(element: WebElement, cssClass: string) {
        const cssClasses = ('' + await element.getAttribute('class')).split(' ');

        return cssClasses.indexOf(cssClass) >= 0;
    }

    static async assertTabIsNotMarkedAsFocused(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return !await this.hasCssClass(tab, 'active');
        }, 10000, 'Tab is marked as focused');
    }

    static async assertTabIsMarkedAsLoading(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return await this.hasCssClass(tab, 'loading');
        }, 10000, 'Tab is not marked as focused');
    }

    static async assertTabIsNotMarkedAsLoading(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return !await this.hasCssClass(tab, 'loading');
        }, 10000, 'Tab is marked as focused');
    }

    static async assertCloseButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.actions().move({origin: tab}).perform();
        await sleep(200);

        const closeButton = tab.findElement(By.css('.close-button'));

        if (await closeButton.isDisplayed()) {
            throw new Error(`Close button of tab at position ${tabPosition} of workspace "${workspaceId}" is visible`);
        }
    }
}
