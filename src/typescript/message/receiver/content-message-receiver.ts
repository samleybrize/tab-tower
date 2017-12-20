import { Message } from '../message';
import { MessageHandler } from './message-handler';
import { MessageReceiver } from './message-receiver';

export class ContentMessageReceiver implements MessageReceiver {
    private isListening = false;

    constructor(private messageHandler: MessageHandler) {
    }

    listen(): void {
        if (this.isListening) {
            return;
        }

        browser.runtime.onConnect.addListener((port) => {
            port.onMessage.addListener((message: Message) => {
                this.messageHandler.handleMessage(message);
            });
        });

        this.isListening = true;
    }
}
