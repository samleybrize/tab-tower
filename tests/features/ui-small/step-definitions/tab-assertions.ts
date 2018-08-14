import { Then } from 'cucumber';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';
import { sleep } from '../../../../src/typescript/utils/sleep';
import { TestPageNames } from '../../../webdriver/test-page-descriptor';
import { WebdriverHelper } from '../../../webdriver/webdriver-helper';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

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

Then('I should see the url {string} on the tab {int} of the workspace {string}', async function(expectedUrl: string, tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tab = await TabAssertions.getTabAtPosition(webdriver, workspaceId, tabPosition);

    await TabAssertions.assertTabUrl(webdriver, webdriverHelper, tab, expectedUrl);
});

Then('I should see the url domain {string} on the tab {int} of the workspace {string}', async function(expectedDomain: string, tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const webdriverHelper = world.webdriverRetriever.getWebdriverHelper();
    const tab = await TabAssertions.getTabAtPosition(webdriver, workspaceId, tabPosition);

    await TabAssertions.assertTabDomain(webdriver, webdriverHelper, tab, expectedDomain);
});

Then('I should not see the url domain of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabUrlDomainIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the url domain of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabUrlDomainIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the url of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabUrlIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the url of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabUrlIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the favicon of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabFaviconIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the favicon of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabFaviconIsVisible(world, workspaceId, tabPosition);
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

Then('I should not see the tab {int} as being moved on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsNotMarkedAsBeingMoved(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as being moved on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsMarkedAsBeingMoved(world, workspaceId, tabPosition);
});

Then('I should not see the tab {int} as selected on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsNotMarkedAsSelected(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as selected on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsMarkedAsSelected(world, workspaceId, tabPosition);
});

Then('I should not see the tab {int} as discarded on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsNotMarkedAsDiscarded(world, workspaceId, tabPosition);
});

Then('I should see the tab {int} as discarded on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabIsMarkedAsDiscarded(world, workspaceId, tabPosition);
});

Then('there should not be a visible close button on the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertCloseButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('there should be a visible close button on the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertCloseButtonIsVisible(world, workspaceId, tabPosition);
});

Then('the tab selector of the tab {int} on the workspace {string} should not be visible', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabSelectorIsNotVisible(world, workspaceId, tabPosition);
});

Then('the context menu of the tab {int} on the workspace {string} should not be visible', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuIsNotVisible(world, workspaceId, tabPosition);
});

Then('the context menu of the tab {int} on the workspace {string} should be visible', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the mute button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuMuteButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the mute button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuMuteButtonIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the unmute button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuUnmuteButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the unmute button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuUnmuteButtonIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the pin button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuPinButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the pin button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuPinButtonIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the unpin button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuUnpinButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the unpin button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuUnpinButtonIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the discard button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuDiscardButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the discard button on the tab context menu of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabContextMenuDiscardButtonIsVisible(world, workspaceId, tabPosition);
});

Then('I should not see the move above button on the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabMoveAboveButtonIsNotVisible(world, workspaceId, tabPosition);
});

Then('I should see the move above button on the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabMoveAboveButtonIsVisible(world, workspaceId, tabPosition);
});

Then('the tab {int} on the workspace {string} should be visible in the viewport', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertUnpinnedTabFullyVisibleInViewport(world, workspaceId, tabPosition);
});

Then('the title of the tab {int} on the workspace {string} should not be clickable', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabTitleIsNotClickable(world, workspaceId, tabPosition);
});

Then('the title of the tab {int} on the workspace {string} should be on one line', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabTitleIsOnOneLine(world, workspaceId, tabPosition);
});

Then('the title of the tab {int} on the workspace {string} should be on several lines', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabTitleIsOnSeveralLines(world, workspaceId, tabPosition);
});

Then('the url of the tab {int} on the workspace {string} should be on one line', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabUrlIsOnOneLine(world, workspaceId, tabPosition);
});

Then('the url of the tab {int} on the workspace {string} should be on several lines', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    await TabAssertions.assertTabUrlIsOnSeveralLines(world, workspaceId, tabPosition);
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

        await this.assertTabTitleTooltip(webdriver, webdriverHelper, tab, testPageDescriptor.title);
        await this.assertTabUrl(webdriver, webdriverHelper, tab, testPageDescriptor.url);
        await this.assertTabDomain(webdriver, webdriverHelper, tab, testPageDescriptor.domain);
        await this.assertTabFavicon(webdriverHelper, tab, testPageDescriptor.faviconUrl);
    }

    static async getTabAtPosition(webdriver: WebDriver, workspaceId: string, tabPosition: number) {
        return TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
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

    static async assertTabTitleTooltip(webdriver: WebDriver, webdriverHelper: WebdriverHelper, tab: WebElement, expectedTitle: string) {
        const tabElementId = await tab.getAttribute('id');
        let actualTitle: string;
        await webdriverHelper.wait(async () => {
            actualTitle = await webdriver.executeScript((elementId: string) => {
                return document.querySelector(`#${elementId} .title`).getAttribute('title');
            }, tabElementId) as string;

            return expectedTitle == actualTitle;
        }, 10000, () => `Tab title tooltip "${actualTitle}" is different than expected "${expectedTitle}"`);
    }

    static async assertTabUrl(webdriver: WebDriver, webdriverHelper: WebdriverHelper, tab: WebElement, expectedUrl: string) {
        const tabElementId = await tab.getAttribute('id');
        let actualUrl: string;
        await webdriverHelper.wait(async () => {
            actualUrl = await webdriver.executeScript((elementId: string) => {
                return document.querySelector(`#${elementId} .url`).textContent;
            }, tabElementId) as string;

            return expectedUrl == actualUrl;
        }, 10000, () => `Tab url "${actualUrl}" is different than expected "${expectedUrl}"`);
    }

    static async assertTabUrlIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const urlElement = tab.findElement(By.css('.url'));

        await webdriver.wait(async () => {
            return await urlElement.isDisplayed();
        }, 10000, 'Tab url is not visible');
    }

    static async assertTabUrlIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const urlElement = tab.findElement(By.css('.url'));

        await webdriver.wait(async () => {
            return !await urlElement.isDisplayed();
        }, 10000, 'Tab url is visible');
    }

    static async assertTabDomain(webdriver: WebDriver, webdriverHelper: WebdriverHelper, tab: WebElement, expectedDomain: string) {
        const tabElementId = await tab.getAttribute('id');
        let actualDomain: string;
        await webdriverHelper.wait(async () => {
            actualDomain = await webdriver.executeScript((elementId: string) => {
                return document.querySelector(`#${elementId} .domain`).textContent;
            }, tabElementId) as string;

            return expectedDomain == actualDomain;
        }, 10000, () => `Tab domain "${actualDomain}" is different than expected "${expectedDomain}"`);
    }

    static async assertTabUrlDomainIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const domainElement = tab.findElement(By.css('.domain'));

        await webdriver.wait(async () => {
            return await domainElement.isDisplayed();
        }, 10000, 'Tab url domain is not visible');
    }

    static async assertTabUrlDomainIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const domainElement = tab.findElement(By.css('.domain'));

        await webdriver.wait(async () => {
            return !await domainElement.isDisplayed();
        }, 10000, 'Tab url domain is visible');
    }

    static async assertTabFavicon(webdriverHelper: WebdriverHelper, tab: WebElement, expectedFaviconUrl: string) {
        let actualFaviconUrl: string;
        const faviconElement = tab.findElement(By.css('.favicon img'));
        await webdriverHelper.wait(async () => {
            actualFaviconUrl = await faviconElement.getAttribute('src');

            return expectedFaviconUrl == actualFaviconUrl;
        }, 10000, () => `Tab favicon url "${actualFaviconUrl}" is different than expected "${expectedFaviconUrl}"`);
    }

    static async assertTabFaviconIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const faviconElement = tab.findElement(By.css('.favicon > img'));

        await webdriver.wait(async () => {
            return await faviconElement.isDisplayed();
        }, 10000, 'Tab favicon is not visible');
    }

    static async assertTabFaviconIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        const faviconElement = tab.findElement(By.css('.favicon > img'));

        await webdriver.wait(async () => {
            return !await faviconElement.isDisplayed();
        }, 10000, 'Tab favicon is visible');
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
            return await TabSupport.hasCssClass(tab, 'active');
        }, 10000, 'Tab is not marked as focused');
    }

    static async assertTabIsNotMarkedAsFocused(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return !await TabSupport.hasCssClass(tab, 'active');
        }, 10000, 'Tab is marked as focused');
    }

    static async assertTabIsMarkedAsLoading(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return await TabSupport.hasCssClass(tab, 'loading');
        }, 10000, 'Tab is not marked as loading');
    }

    static async assertTabIsNotMarkedAsLoading(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return !await TabSupport.hasCssClass(tab, 'loading');
        }, 10000, 'Tab is marked as loading');
    }

    static async assertTabIsMarkedAsBeingMoved(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return await TabSupport.hasCssClass(tab, 'being-moved');
        }, 10000, 'Tab is not marked as being moved');
    }

    static async assertTabIsNotMarkedAsBeingMoved(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return !await TabSupport.hasCssClass(tab, 'being-moved');
        }, 10000, 'Tab is marked as being moved');
    }

    static async assertTabIsMarkedAsSelected(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const checkboxElement = tab.findElement(By.css('.tab-selector input'));
        const checkedIconElement = tab.findElement(By.css('.tab-selector .checked'));
        const uncheckedIconElement = tab.findElement(By.css('.tab-selector .unchecked'));
        const faviconElement = tab.findElement(By.css('.favicon > img'));

        await webdriver.actions().move({x: 0, y: 0}).perform();

        await webdriver.wait(async () => {
            return await checkedIconElement.isDisplayed() && !await uncheckedIconElement.isDisplayed() && !await faviconElement.isDisplayed() && await checkboxElement.isSelected();
        }, 10000, 'Tab is not marked as selected');
    }

    static async assertTabIsNotMarkedAsSelected(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const checkboxElement = tab.findElement(By.css('.tab-selector input'));
        const tabSelectorContainerElement = tab.findElement(By.css('.tab-selector .checkbox-icon'));

        await webdriver.actions().move({x: 0, y: 0}).perform();

        await webdriver.wait(async () => {
            return !await tabSelectorContainerElement.isDisplayed() && !await checkboxElement.isSelected();
        }, 10000, 'Tab is marked as selected');
    }

    static async assertTabIsMarkedAsDiscarded(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return await TabSupport.hasCssClass(tab, 'discarded');
        }, 10000, 'Tab is not marked as discarded');
    }

    static async assertTabIsNotMarkedAsDiscarded(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return !await TabSupport.hasCssClass(tab, 'discarded');
        }, 10000, 'Tab is marked as discarded');
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

    static async assertCloseButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.actions().move({origin: tab}).perform();
        await sleep(200);

        const closeButton = tab.findElement(By.css('.close-button'));

        if (!await closeButton.isDisplayed()) {
            throw new Error(`Close button of tab at position ${tabPosition} of workspace "${workspaceId}" is not visible`);
        }
    }

    static async assertTabSelectorIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.actions().move({origin: tab}).perform();
        await sleep(200);

        const tabSelector = tab.findElement(By.css('.tab-selector .checkbox-icon'));

        if (await tabSelector.isDisplayed()) {
            throw new Error(`Tab selector of tab at position ${tabPosition} of workspace "${workspaceId}" is visible`);
        }
    }

    static async assertUnpinnedTabFullyVisibleInViewport(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);

        await webdriver.wait(async () => {
            return this.isUnpinnedTabFullyVisibleInViewport(webdriver, tab);
        }, 10000, `Unpinned tab at position ${tabPosition} on workspace "${workspaceId}" is not fully visible in the viewport`);
    }

    private static async isUnpinnedTabFullyVisibleInViewport(webdriver: WebDriver, tab: WebElement) {
        if (!await tab.isDisplayed()) {
            return false;
        }

        const unpinnedTabListCoordinates = await this.getUnpinnedTabListViewportCoordinates(webdriver);
        const tabCoordinates = await this.getElementViewportCoordinates(webdriver, tab);

        if (tabCoordinates.top < unpinnedTabListCoordinates.top || tabCoordinates.bottom > unpinnedTabListCoordinates.bottom) {
            return false;
        }

        return true;
    }

    private static async getUnpinnedTabListViewportCoordinates(webdriver: WebDriver): Promise<ClientRect> {
        return this.getElementViewportCoordinates(webdriver, webdriver.findElement(By.css('.unpinned-tabs')));
    }

    private static async getElementViewportCoordinates(webdriver: WebDriver, element: WebElement) {
        return webdriver.executeScript((e: HTMLElement) => {
            return e.getBoundingClientRect();
        }, element) as Promise<ClientRect>;
    }

    static async assertTabContextMenuIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const contextMenu = tab.findElement(By.css('.context-menu'));

        await webdriver.wait(async () => {
            return await contextMenu.isDisplayed();
        }, 10000, `Context menu of tab at position ${tabPosition} on workspace "${workspaceId}" is not visible`);
    }

    static async assertTabContextMenuIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const contextMenu = tab.findElement(By.css('.context-menu'));

        await webdriver.wait(async () => {
            return !await contextMenu.isDisplayed();
        }, 10000, `Context menu of tab at position ${tabPosition} on workspace "${workspaceId}" is visible`);
    }

    static async assertTabContextMenuMuteButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsNotVisible(tab, 'mute-button', 'mute', workspaceId, tabPosition);
    }

    static async assertTabContextMenuMuteButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsVisible(tab, 'mute-button', 'mute', workspaceId, tabPosition);
    }

    private static async openTabContextMenu(webdriver: WebDriver, tab: WebElement) {
        const contextMenu = tab.findElement(By.css('.context-menu'));
        const titleElement = tab.findElement(By.css('.title'));

        if (!await contextMenu.isDisplayed()) {
            await webdriver.actions().contextClick(titleElement).perform();
        }
    }

    private static async waitThatTabContextMenuIsVisible(webdriver: WebDriver, tab: WebElement) {
        const contextMenu = tab.findElement(By.css('.context-menu'));

        await webdriver.wait(async () => {
            return contextMenu.isDisplayed();
        }, 10000);
    }

    private static async assertThatTabContextMenuButtonIsNotVisible(tab: WebElement, buttonCssClass: string, buttonLabel: string, workspaceId: string, tabPosition: number) {
        const button = tab.findElement(By.css(`.context-menu .${buttonCssClass}`));

        if (await button.isDisplayed()) {
            throw new Error(`Tab context menu ${buttonLabel} button of tab at position ${tabPosition} of workspace "${workspaceId}" is visible`);
        }
    }

    private static async assertThatTabContextMenuButtonIsVisible(tab: WebElement, buttonCssClass: string, buttonLabel: string, workspaceId: string, tabPosition: number) {
        const button = tab.findElement(By.css(`.context-menu .${buttonCssClass}`));

        if (!await button.isDisplayed()) {
            throw new Error(`Tab context menu ${buttonLabel} button of tab at position ${tabPosition} of workspace "${workspaceId}" is not visible`);
        }
    }

    static async assertTabContextMenuUnmuteButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsNotVisible(tab, 'unmute-button', 'unmute', workspaceId, tabPosition);
    }

    static async assertTabContextMenuUnmuteButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsVisible(tab, 'unmute-button', 'unmute', workspaceId, tabPosition);
    }

    static async assertTabContextMenuPinButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsNotVisible(tab, 'pin-button', 'pin', workspaceId, tabPosition);
    }

    static async assertTabContextMenuPinButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsVisible(tab, 'pin-button', 'pin', workspaceId, tabPosition);
    }

    static async assertTabContextMenuUnpinButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsNotVisible(tab, 'unpin-button', 'unpin', workspaceId, tabPosition);
    }

    static async assertTabContextMenuUnpinButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsVisible(tab, 'unpin-button', 'unpin', workspaceId, tabPosition);
    }

    static async assertTabContextMenuDiscardButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsNotVisible(tab, 'discard-button', 'discard', workspaceId, tabPosition);
    }

    static async assertTabContextMenuDiscardButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        await this.openTabContextMenu(webdriver, tab);
        await this.waitThatTabContextMenuIsVisible(webdriver, tab);
        await this.assertThatTabContextMenuButtonIsVisible(tab, 'discard-button', 'discard', workspaceId, tabPosition);
    }

    static async assertTabMoveAboveButtonIsNotVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const buttonElement = tab.findElement(By.css('.move-above-button'));

        await webdriver.wait(async () => {
            return !await buttonElement.isDisplayed();
        }, 10000, 'Tab move above button is visible');
    }

    static async assertTabMoveAboveButtonIsVisible(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const buttonElement = tab.findElement(By.css('.move-above-button'));

        await webdriver.wait(async () => {
            return await buttonElement.isDisplayed();
        }, 10000, 'Tab move above button is not visible');
    }

    static async assertTabTitleIsNotClickable(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const titleContainer = tab.findElement(By.css('.title-container'));

        try {
            await titleContainer.click();
        } catch (error) {
            if (error instanceof WebDriverError.ElementClickInterceptedError) {
                return;
            }

            throw error;
        }

        throw new Error('Tab title is clickable');
    }

    static async assertTabTitleIsOnOneLine(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const titleElement = tab.findElement(By.css('.title'));

        await webdriver.wait(async () => {
            return await this.isElementTextOnOneLine(webdriver, titleElement);
        }, 10000, 'Tab title is not on one line');
    }

    private static async isElementTextOnOneLine(webdriver: WebDriver, element: WebElement): Promise<boolean> {
        return webdriver.executeScript<boolean>((e: HTMLElement) => {
            const originalHeight = e.offsetHeight;
            const originalText = e.textContent;
            e.textContent = 'I';
            const newHeight = e.offsetHeight;
            e.textContent = originalText;

            return originalHeight === newHeight;
        }, element);
    }

    static async assertTabTitleIsOnSeveralLines(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const titleElement = tab.findElement(By.css('.title'));

        await webdriver.wait(async () => {
            return !await this.isElementTextOnOneLine(webdriver, titleElement);
        }, 10000, 'Tab title is not on several lines');
    }

    static async assertTabUrlIsOnOneLine(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const urlElement = tab.findElement(By.css('.url'));

        await webdriver.wait(async () => {
            return await urlElement.isDisplayed() && await this.isElementTextOnOneLine(webdriver, urlElement);
        }, 10000, 'Tab url is not on one line');
    }

    static async assertTabUrlIsOnSeveralLines(world: World, workspaceId: string, tabPosition: number) {
        const webdriver = world.webdriverRetriever.getDriver();
        const tab = await this.getTabAtPosition(webdriver, workspaceId, tabPosition);
        const urlElement = tab.findElement(By.css('.url'));

        await webdriver.wait(async () => {
            return await urlElement.isDisplayed() && !await this.isElementTextOnOneLine(webdriver, urlElement);
        }, 10000, 'Tab url is not on several lines');
    }
}
