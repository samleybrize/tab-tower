import { Message } from '../message';
import { MessageSender } from './message-sender';

export class ContentMessageSender implements MessageSender {
    private portToBackground: browser.runtime.Port = null;

    async send(message: Message) {
        const portToBackground = this.getPortToBackground();
        portToBackground.postMessage(message);
    }

    private getPortToBackground() {
        if (null === this.portToBackground) {
            this.portToBackground = browser.runtime.connect();
        }

        return this.portToBackground;
    }
}
