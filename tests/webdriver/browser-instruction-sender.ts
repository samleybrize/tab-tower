import * as http from 'http';
import { WebDriver } from 'selenium-webdriver';
import { server as WebSocketServer } from 'websocket';

interface Message {
    action: string;
    data: any;
}

export class BrowserInstructionSender {
    private static instance: BrowserInstructionSender = null;

    private httpServer: http.Server = null;
    private websocketServer: WebSocketServer = null;

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
            request.accept(null, request.origin);
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

    async reloadTab(tabIndex: number, bypassCache?: boolean) {
        return this.send({action: 'reload-tab', data: {tabIndex, bypassCache: !!bypassCache}});
    }

    async openTab(url?: string) {
        return this.send({action: 'open-tab', data: {url}});
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

    async triggerDoubleClick(webdriver: WebDriver, quotelessCssSelector: string) {
        return webdriver.executeScript(`
            var doubleClickEvent = document.createEvent('MouseEvents');
            doubleClickEvent.initEvent('dblclick', true, true);
            document.querySelector('${quotelessCssSelector}').dispatchEvent(doubleClickEvent);
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
        return this.send({action: 'focus-tab', data: {tabIndex}});
    }
}
