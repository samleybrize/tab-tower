import { error as WebDriverError, WebDriver } from 'selenium-webdriver';
import { sleep } from '../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../utils/browser-instruction-sender';

const defaultWindowWidth = 500;
const defaultWindowHeight = 600;

export class WebdriverHelper {
    constructor(private webdriver: WebDriver, private browserInstructionSender: BrowserInstructionSender) {
    }

    // allow to use a function that constructs the fail message, this is needed to include some values retrieved from within the wait function
    async wait(condition: any, timeout?: number, errorMessage?: (() => string|Promise<string>)|string) {
        const errorMessageString: string = ('string' == typeof errorMessage) ? errorMessage : null;

        try {
            return await this.webdriver.wait(condition, timeout, errorMessageString);
        } catch (error) {
            if (error instanceof WebDriverError.TimeoutError && errorMessage instanceof Function) {
                const newError = new WebDriverError.TimeoutError(await errorMessage());
                newError.stack = error.stack;

                throw newError;
            } else {
                throw error;
            }
        }
    }

    // execute a script in the context of the extension, usefull to access the web extension api
    async executeScript<T>(script: ((...args: any[]) => T)|string, args?: any[]) {
        if ('function' === typeof script) {
            script = '' + script;
        }

        return this.browserInstructionSender.send<T>(script, args);
    }

    async resetBrowserState(firstPageUrl: string) {
        await this.webdriver; // ensure the browser is running to avoid errors

        await this.closeAllTabs();
        await this.clearRecentlyClosedTabs();
        await this.clearBrowserStorage();

        await this.reloadExtension();
        await this.switchToWindowHandle(0);
        await this.webdriver.get(firstPageUrl);
        await this.setDefaultWindowSize();
    }

    private async closeAllTabs() {
        await this.executeScript(async () => {
            const tabList = await browser.tabs.query({});
            const idList: number[] = [];

            for (const tab of tabList) {
                idList.push(tab.id);
            }

            if (idList.length > 0) {
                await browser.tabs.remove(idList);
            }
        });
    }

    private async clearRecentlyClosedTabs() {
        await this.executeScript(async () => {
            const recentlyClosedTabList = await browser.sessions.getRecentlyClosed();

            for (const recentlyClosedTab of recentlyClosedTabList) {
                if (recentlyClosedTab.tab) {
                    await browser.sessions.forgetClosedTab(recentlyClosedTab.tab.windowId, recentlyClosedTab.tab.sessionId);
                }
            }
        });
    }

    private async clearBrowserStorage() {
        await this.executeScript(async () => {
            await browser.storage.local.clear();
        });
    }

    private async setDefaultWindowSize() {
        await this.executeScript(async (width, height) => {
            const window = await browser.windows.getCurrent();
            await browser.windows.update(window.id, {state: 'normal'});
            await browser.windows.update(window.id, {width, height});
        }, [defaultWindowWidth, defaultWindowHeight]);
    }

    private async reloadExtension() {
        await this.executeScript(() => browser.runtime.reload());
        await sleep(1000);
    }

    async switchToWindowHandle(windowIndex: number) {
        const windowHandles = await this.webdriver.getAllWindowHandles();
        await this.webdriver.switchTo().window(windowHandles[windowIndex]);
    }
}
