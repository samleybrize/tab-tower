import { By, WebElement } from 'selenium-webdriver';
import { sleep } from '../../../../src/typescript/utils/sleep';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';
import { BrowserSupport } from './browser-support';

export enum TabContextMenuButtons {
    MANAGE_TAGS = 'manage-tags-button',
    RELOAD = 'reload-button',
    MUTE = 'mute-button',
    UNMUTE = 'unmute-button',
    PIN = 'pin-button',
    UNPIN = 'unpin-button',
    DUPLICATE = 'duplicate-button',
    DISCARD = 'discard-button',
    MOVE = 'move-button',
    CLOSE = 'close-button',
}

export class OpenedTabListSupport {
    constructor(private webdriverRetriever: WebDriverRetriever, private browserSupport: BrowserSupport, private waitTimeout: number) {
    }

    getAllTabElements(tabListId: string) {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElements(By.css(`.tab-list [data-tab-list-id="${tabListId}"] .tab`));
    }

    getNoTabMatchesTabSearchElement(tabListId: string): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css(`.tab-list [data-tab-list-id="${tabListId}"] .no-tab-matches-search`));
    }

    getUnpinnedTabsListElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.unpinned-tabs'));
    }

    async getTabAtPosition(tabListId: string, tabPosition: number, condition: 'visible'|'filtered'): Promise<WebElement> {
        let excludePinnedSelector = '';
        let includeTabSelector = '';

        if ('pinned-tabs' != tabListId) {
            excludePinnedSelector = ':not(.pinned)';
        }

        if ('filtered' == condition) {
            includeTabSelector = '.hide';
        } else {
            includeTabSelector = ':not(.hide)';
        }

        let matchingTab: WebElement;
        const webdriver = this.webdriverRetriever.getDriver();
        await webdriver.wait(async () => {
            let tabList = await webdriver.findElements(By.css(`.tab-list [data-tab-list-id="${tabListId}"] .tab${includeTabSelector}${excludePinnedSelector}`));
            tabList = await this.sortByCssOrder(tabList);
            let position = 0;

            for (const tab of tabList) {
                if ('visible' === condition && !await tab.isDisplayed()) {
                    continue;
                } else if (position === tabPosition) {
                    matchingTab = tab;

                    break;
                }

                position++;
            }

            return !!matchingTab;
        }, 10000, `Tab at position ${tabPosition} on tab list "${tabListId}" does not exists`);

        return matchingTab;
    }

    private async sortByCssOrder(elementList: WebElement[]): Promise<WebElement[]> {
        for (let attempt = 1; attempt <= 50; attempt++) {
            try {
                // remove missing tabs in case tabs were just closed
                elementList = await this.removeUnavailableElements(elementList);
                const comparableArray = await Promise.all(elementList.map(async (x) => [await x.getCssValue('order'), x]));
                comparableArray.sort((a, b) => +(a[0] > b[0]) || -(a[0] < b[0]));

                return comparableArray.map(x => x[1]) as WebElement[];
            } catch (error) {
                if (attempt >= 50) {
                    throw error;
                }

                await sleep(100);
            }
        };
    }

    private async removeUnavailableElements(elementList: WebElement[]): Promise<WebElement[]> {
        const filteredList: WebElement[] = [];

        for (const element of elementList) {
            try {
                await element.getCssValue('order');
                filteredList.push(element);
            } catch (error) {
            }
        }

        return filteredList;
    }

    getStickyFocusedTab() {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.focused-tab .tab'));
    }

    getTabTitleContainerElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.title-container'));
    }

    getTabTitleElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.title'));
    }

    async getTabTitle(tab: WebElement): Promise<string> {
        const titleElement = await this.getTabTitleElement(tab);

        return titleElement.getText();
    }

    async getTabTitleTooltip(tab: WebElement): Promise<string> {
        const webdriver = this.webdriverRetriever.getDriver();
        const titleElement = await this.getTabTitleElement(tab);

        return await webdriver.executeScript((element: HTMLElement) => {
            return element.getAttribute('title');
        }, titleElement) as string;
    }

    getTabUrlElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.url'));
    }

    async getTabUrl(tab: WebElement): Promise<string> {
        const webdriver = this.webdriverRetriever.getDriver();
        const urlElement = await this.getTabUrlElement(tab);

        let url = await webdriver.executeScript((element: HTMLElement) => {
            return element.textContent;
        }, urlElement) as string;

        if ('about:blank' == url) {
            url = 'about:newtab';
        }

        return url;
    }

    getTabUrlDomainElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.domain'));
    }

    async getTabUrlDomain(tab: WebElement): Promise<string> {
        const webdriver = this.webdriverRetriever.getDriver();
        const domainElement = await this.getTabUrlDomainElement(tab);

        let domain = await webdriver.executeScript((element: HTMLElement) => {
            return element.textContent;
        }, domainElement) as string;

        if ('about:blank' == domain) {
            domain = 'about:newtab';
        }

        return domain;
    }

    getTabFaviconElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.favicon > img'));
    }

    async getTabFaviconUrl(tab: WebElement): Promise<string> {
        const faviconElement = this.getTabFaviconElement(tab);

        return faviconElement.getAttribute('src');
    }

    getTabSelectorElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.tab-selector'));
    }

    getTabAudibleIconElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.audible-icon'));
    }

    getTabMutedIconElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.muted-icon'));
    }

    getTabCloseButtonElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.close-button'));
    }

    getTabMoveAboveButtonElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.move-above-button'));
    }

    getTabContextMenuElement(tab: WebElement): WebElement {
        return tab.findElement(By.css('.context-menu'));
    }

    getTabContextMenuButtonElement(tab: WebElement, button: TabContextMenuButtons): WebElement {
        const contextMenuElement = this.getTabContextMenuElement(tab);

        return contextMenuElement.findElement(By.css(`.${button}`));
    }

    isTabMarkedAsFocused(tab: WebElement): Promise<boolean> {
        return this.browserSupport.hasCssClass(tab, 'active');
    }

    isTabMarkedAsLoading(tab: WebElement): Promise<boolean> {
        return this.browserSupport.hasCssClass(tab, 'loading');
    }

    isTabMarkedAsDiscarded(tab: WebElement): Promise<boolean> {
        return this.browserSupport.hasCssClass(tab, 'discarded');
    }

    isTabMarkedAsBeingMoved(tab: WebElement): Promise<boolean> {
        return this.browserSupport.hasCssClass(tab, 'being-moved');
    }

    async isTabSelectorVisible(tab: WebElement): Promise<boolean> {
        const tabSelectorElement = this.getTabSelectorElement(tab);
        const tabSelectorContainerElement = tabSelectorElement.findElement(By.css('.checkbox-icon'));

        return tabSelectorContainerElement.isDisplayed();
    }

    async isTabMarkedAsSelected(tab: WebElement): Promise<boolean> {
        const tabSelectorElement = this.getTabSelectorElement(tab);
        const checkboxElement = tabSelectorElement.findElement(By.css('input'));
        const checkedIconElement = tabSelectorElement.findElement(By.css('.checked'));
        const uncheckedIconElement = tabSelectorElement.findElement(By.css('.unchecked'));

        if (await tab.isDisplayed()) {
            return await checkedIconElement.isDisplayed() && !await uncheckedIconElement.isDisplayed() && await checkboxElement.isSelected();
        } else {
            return await checkboxElement.isSelected();
        }
    }

    async isTabNotMarkedAsSelected(tab: WebElement): Promise<boolean> {
        const tabSelectorElement = this.getTabSelectorElement(tab);
        const checkboxElement = tabSelectorElement.findElement(By.css('input'));
        const tabSelectorContainerElement = tabSelectorElement.findElement(By.css('.checkbox-icon'));

        if (await tab.isDisplayed()) {
            return !await tabSelectorContainerElement.isDisplayed() && !await checkboxElement.isSelected();
        } else {
            return !await checkboxElement.isSelected();
        }
    }
}
