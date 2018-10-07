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

        let tab: WebElement;
        await webdriver.wait(async () => {
            const tabList = await webdriver.findElements(By.css(`.tab-list [data-tab-list-id="${tabListId}"] .tab${includeTabSelector}${excludePinnedSelector}`));
            tab = tabList[tabPosition];

            return !!tab;
        }, 10000, `Tab at position ${tabPosition} on tab list "${tabListId}" does not exists`);

        return tab;
    }

    static async clickElementOnceAvailable(webdriver: WebDriver, element: WebElement, failMessage: string) {
        await webdriver.wait(async () => {
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

    static async hasCssClass(element: WebElement, cssClass: string) {
        const cssClasses = ('' + await element.getAttribute('class')).split(' ');

        return cssClasses.indexOf(cssClass) >= 0;
    }
}
