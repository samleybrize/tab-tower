import { By, WebDriver } from 'selenium-webdriver';

export class TabSupport {
    static async getTabAtPosition(webdriver: WebDriver, workspaceId: string, tabPosition: number) {
        let excludePinnedSelector = '';

        if ('pinned-tabs' != workspaceId) {
            excludePinnedSelector = ':not(.pinned)';
        }

        const tabList = await webdriver.findElements(By.css(`.tab-list [data-workspace-id="${workspaceId}"] .tab:not(.hide)${excludePinnedSelector}`));

        return tabList[tabPosition];
    }
}
