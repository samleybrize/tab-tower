import * as http from 'http';
import { WebDriver } from 'selenium-webdriver';
import { IMessage, server as WebSocketServer } from 'websocket';

interface Message {
    action: string;
    data: any;
}

export class BrowserInstructionSender {
    private static instance: BrowserInstructionSender = null;

    private httpServer: http.Server = null;
    private websocketServer: WebSocketServer = null;
    private receiveCallbackMap = new Map<number, (message: any) => void>();

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    init() {
        if (null !== this.websocketServer) {
            return;
        }

        this.httpServer = http.createServer((request, response) => {
            response.writeHead(404);
            response.end();
        });
        this.httpServer.listen(8888); // TODO param

        this.websocketServer = new WebSocketServer({
            httpServer: this.httpServer,
        });

        this.websocketServer.on('request', (request) => {
            const connection = request.accept(null, request.origin);
            connection.on('message', (data: IMessage) => {
                const message = JSON.parse(data.utf8Data);

                if (message && message.messageId && this.receiveCallbackMap.has(message.messageId)) {
                    const callback = this.receiveCallbackMap.get(message.messageId);
                    callback(message);
                }
            });
        });
    }

    shutdown(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer.close(() => {
                this.httpServer = null;
                resolve();
            });

            this.websocketServer.closeAllConnections();
            this.websocketServer = null;
        });
    }

    private async send(message: Message) {
        if (null == this.websocketServer) {
            throw new Error('Websocket server not initialized');
        }

        this.websocketServer.broadcastUTF(JSON.stringify(message));
    }

    async resetBrowserState() {
        return new Promise<void>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve();
            });
            this.send({action: 'reset-browser-state', data: {messageId}});
        });
    }

    async reloadTab(tabIndex: number, bypassCache?: boolean) {
        return this.send({action: 'reload-tab', data: {tabIndex, bypassCache: !!bypassCache}});
    }

    async openTab(url?: string, index?: number) {
        return this.send({action: 'open-tab', data: {url, index}});
    }

    async duplicateTab(index: number): Promise<browser.tabs.Tab> {
        return new Promise<browser.tabs.Tab>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve(message ? message.newTab : null);
            });
            this.send({action: 'duplicate-tab', data: {messageId, tabIndex: index}});
        });
    }

    async closeTab(tabIndex: number) {
        return this.send({action: 'close-tab', data: {tabIndex}});
    }

    async moveTab(tabIndex: number, targetIndex: number) {
        return this.send({action: 'move-tab', data: {tabIndex, targetIndex}});
    }

    async changeTabUrl(tabIndex: number, newUrl: string) {
        return this.send({action: 'change-tab-url', data: {tabIndex, url: newUrl}});
    }

    async toggleReaderMode(tabIndex: number) {
        return this.send({action: 'toggle-reader-mode', data: {tabIndex}});
    }

    async createWindow(isIncognito: boolean, url: string) {
        return this.send({action: 'create-window', data: {
            isIncognito,
            url,
        }});
    }

    async restoreRecentlyClosedTab(index: number) {
        return new Promise<number>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve(message.restoredTabIndex);
            });
            this.send({action: 'restore-recently-closed-tab', data: {messageId, index}});
        });
    }

    async clearRecentlyClosedTabs() {
        return new Promise<void>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve();
            });
            this.send({action: 'clear-recently-closed-tabs', data: {messageId}});
        });
    }

    async triggerDoubleClick(webdriver: WebDriver, quotelessCssSelector: string) {
        return webdriver.executeScript(`
            var doubleClickEvent = document.createEvent('MouseEvents');
            doubleClickEvent.initEvent('dblclick', true, true);
            var elements = Array.from(document.querySelectorAll('${quotelessCssSelector}'));

            for (var element of elements) {
                element.dispatchEvent(doubleClickEvent);
            }
        `);
    }

    async focusElement(webdriver: WebDriver, quotelessCssSelector: string) {
        return webdriver.executeScript(`
            document.querySelector('${quotelessCssSelector}').focus();
        `);
    }

    async blurElement(webdriver: WebDriver, quotelessCssSelector: string) {
        return webdriver.executeScript(`
            document.querySelector('${quotelessCssSelector}').blur();
        `);
    }

    async makeTabGoToPreviousPage(tabIndex: number) {
        return this.send({action: 'make-tab-go-to-previous-page', data: {tabIndex}});
    }

    async focusTab(tabIndex: number) {
        return new Promise<void>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve();
            });
            this.send({action: 'focus-tab', data: {messageId, tabIndex}});
        });
    }

    async changeElementText(webdriver: WebDriver, quotelessCssSelector: string, newText: string) {
        return webdriver.executeScript(`
            document.querySelector('${quotelessCssSelector}').innerHtml = '${newText}';
        `);
    }

    async reloadExtension() {
        return this.send({action: 'reload-extension', data: {}});
    }

    async getActiveTab(): Promise<browser.tabs.Tab> {
        return new Promise<browser.tabs.Tab>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve(message ? message.activeTab : null);
            });
            this.send({action: 'get-active-tab', data: {messageId}});
        });
    }

    async getTab(tabIndex: number): Promise<browser.tabs.Tab> {
        return new Promise<browser.tabs.Tab>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve(message ? message.tab : null);
            });
            this.send({action: 'get-tab', data: {messageId, tabIndex}});
        });
    }

    async getAllTabs(): Promise<browser.tabs.Tab[]> {
        return new Promise<browser.tabs.Tab[]>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve(message ? message.tabList : null);
            });
            this.send({action: 'get-all-tabs', data: {messageId}});
        });
    }

    async getAllRecentlyClosedTabs(): Promise<browser.sessions.Session[]> {
        return new Promise<browser.sessions.Session[]>((resolve, reject) => {
            const messageId = Math.random();
            this.receiveCallbackMap.set(messageId, (message) => {
                resolve(message ? message.recentlyClosedTabList : null);
            });
            this.send({action: 'get-all-recently-closed-tabs', data: {messageId}});
        });
    }
}
