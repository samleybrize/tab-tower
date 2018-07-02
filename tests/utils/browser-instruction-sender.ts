import * as http from 'http';
import { IMessage, server as WebSocketServer } from 'websocket';
import { sleep } from '../../src/typescript/utils/sleep';
import { TestsConfig } from '../tests-config';

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

        const testsConfig = TestsConfig.getInstance();
        this.httpServer = http.createServer((request, response) => {
            response.writeHead(404);
            response.end();
        });
        this.httpServer.listen(testsConfig.browserInstructionPort);

        this.websocketServer = new WebSocketServer({
            httpServer: this.httpServer,
        });

        this.websocketServer.on('request', (request) => {
            const connection = request.accept(null, request.origin);
            connection.on('message', (data: IMessage) => {
                const message = JSON.parse(data.utf8Data);

                if (message && message.messageId && this.receiveCallbackMap.has(message.messageId)) {
                    const callback = this.receiveCallbackMap.get(message.messageId);
                    this.receiveCallbackMap.delete(message.messageId);
                    callback(message.returnValue);
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

    async send<T>(script: string, args?: any[]) {
        if (null == this.websocketServer) {
            throw new Error('Websocket server not initialized');
        } else if (null == args) {
            args = [];
        }

        await this.waitAtLeastOneClientConnected();

        const messageId = Math.random();
        const message = JSON.stringify({messageId, script, args});

        return new Promise<T>((resolve, reject) => {
            this.receiveCallbackMap.set(messageId, (returnValue) => {
                if (returnValue && returnValue.error) {
                    reject(`Remote error: ${returnValue.error}`);
                } else {
                    resolve(returnValue);
                }
            });
            this.websocketServer.broadcastUTF(message);
        });
    }

    private async waitAtLeastOneClientConnected() {
        while (!this.hasConnectedClients()) {
            await sleep(50);
        }
    }

    hasConnectedClients() {
        return this.websocketServer.connections.length > 0;
    }
}
