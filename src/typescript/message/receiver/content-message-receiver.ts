import { Message } from '../message';
import { MessageReceiver } from './message-receiver';
import { ReceivedMessageHandler } from './received-message-handler';

export class ContentMessageReceiver implements MessageReceiver {
    private isListening = false;

    constructor(private messageHandler: ReceivedMessageHandler) {
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
