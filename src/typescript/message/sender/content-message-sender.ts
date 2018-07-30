import { Logger } from '../../logger/logger';
import { sleep } from '../../utils/sleep';
import { Message } from '../message';
import { MessageSender } from './message-sender';

export class ContentMessageSender implements MessageSender {
    private portToBackground: browser.runtime.Port = null;

    constructor(private logger: Logger) {
    }

    async send(message: Message) {
        const portToBackground = await this.getPortToBackground(1);

        try {
            portToBackground.postMessage(message);
        } catch (error) {
            this.logger.error({
                message: 'Failed to send a message to the background',
                context: {error, message},
            });
            await sleep(100);

            await this.send(message);
        }
    }

    private async getPortToBackground(tryCount: number) {
        if (null === this.portToBackground) {
            try {
                this.portToBackground = browser.runtime.connect();
            } catch (error) {
                if (0 == tryCount % 10) {
                    this.logger.error({message: 'Failed to connect to background', context: error});
                }

                await sleep(100);
                this.getPortToBackground(++tryCount);

                return;
            }

            this.portToBackground.onDisconnect.addListener(this.onPortDisconnect.bind(this));
        }

        return this.portToBackground;
    }

    private onPortDisconnect(port: browser.runtime.Port) {
        if (port.error) {
            this.logger.error({message: 'Background connection lost', context: port.error});
            this.portToBackground = null;
        }
    }
}
