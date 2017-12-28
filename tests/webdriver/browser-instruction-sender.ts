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

    async send(message: Message) {
        if (null == this.websocketServer) {
            throw new Error('Websocket server not initialized');
        }

        this.websocketServer.broadcastUTF(JSON.stringify(message));
    }

    shutdown(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer.close(() => {
                resolve();
            });
        });
    }
}
