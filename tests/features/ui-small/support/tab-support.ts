import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

export class TabSupport {
    // TODO condition must not be optional
    static async getTabAtPosition(webdriver: WebDriver, tabListId: string, tabPosition: number, condition?: 'visible'|'filtered') {
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

    private static async sortByCssOrder(elementList: WebElement[]): Promise<WebElement[]> {
        const comparableArray = await Promise.all(elementList.map(async x => [await x.getCssValue('order'), x]));
        comparableArray.sort((a, b) => +(a[0] > b[0]) || -(a[0] < b[0]));

        return comparableArray.map(x => x[1]) as WebElement[];
    }

    static async clickElementOnceAvailable(webdriver: WebDriver, element: WebElement, failMessage: string, expectedAttribute?: {name: string, value: string}) {
        if (expectedAttribute) {
            await webdriver.wait(async () => {
                const attributeValue = await element.getAttribute(expectedAttribute.name);

                return expectedAttribute.value === attributeValue;
            }, 10000);
        }

        await webdriver.wait(async () => {
            try {
                await element.click();

                return true;
            } catch (error) {
                if (
                    error instanceof WebDriverError.ElementClickInterceptedError
                    || error instanceof WebDriverError.ElementNotInteractableError
                ) {
                    return false;
                }
            }
        }, 10000, failMessage);
    }

    static async hasCssClass(element: WebElement, cssClass: string) {
        const cssClasses = ('' + await element.getAttribute('class')).split(' ');

        return cssClasses.indexOf(cssClass) >= 0;
    }
}
