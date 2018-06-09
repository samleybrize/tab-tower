import * as express from 'express';
import { Server } from 'net';
import { TestsConfig } from '../tests-config';

export class UrlDelayer {
    private static instance: UrlDelayer = null;

    private server: Server = null;
    private serverPort: number;

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    init() {
        if (null !== this.server) {
            return;
        }

        const testsConfig = TestsConfig.getInstance();
        this.serverPort = testsConfig.urlDelayerPort;
        const app = express();

        app.get('/:delay(\\d+)', (request, response) => {
            const delay = request.params.delay;

            setTimeout(() => {
                response.status(200);
                response.send();
            }, delay);
        });

        this.server = app.listen(this.serverPort);
    }

    shutdown(): Promise<void> {
        if (null === this.server) {
            return;
        }

        return new Promise((resolve) => {
            this.server.close(() => {
                this.server = null;
                resolve();
            });
        });
    }

    getDelayedUrl(forUrl: string, delay: number) {
        delay = +delay;
        const encodedUrl = encodeURI(forUrl);
        const delayedUrl = `http://localhost:${this.serverPort}/${delay}/${encodedUrl}`;

        return delayedUrl;
    }
}
