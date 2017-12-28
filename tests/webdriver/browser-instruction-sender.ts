import * as http from 'http';
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
                resolve();
            });
        });
    }

    private async send(message: Message) {
        if (null == this.websocketServer) {
            throw new Error('Websocket server not initialized');
        }

        this.websocketServer.broadcastUTF(JSON.stringify(message));
    }

    async openTab(url: string) {
        return this.send({action: 'open-tab', data: {url}});
    }

    async closeTab(tabIndex: number) {
        return this.send({action: 'close-tab', data: {tabIndex}});
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
}
