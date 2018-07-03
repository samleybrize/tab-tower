import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

export class TabSupport {
    static async getTabAtPosition(webdriver: WebDriver, workspaceId: string, tabPosition: number) {
        let excludePinnedSelector = '';

        if ('pinned-tabs' != workspaceId) {
            excludePinnedSelector = ':not(.pinned)';
        }

        let tab: WebElement;
        await webdriver.wait(async () => {
            const tabList = await webdriver.findElements(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .tab:not(.hide)${excludePinnedSelector}`));
            tab = tabList[tabPosition];

            return !!tab;
        }, 10000, `Tab at position ${tabPosition} on workspace "${workspaceId}" does not exists`);

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
}
