import { Message } from '../message';
import { MessageReceiver } from './message-receiver';
import { ReceivedMessageHandler } from './received-message-handler';

export class BackgroundMessageReceiver implements MessageReceiver {
    private isListening = false;

    constructor(private messageHandler: ReceivedMessageHandler) {
    }

    listen(): void {
        if (this.isListening) {
            return;
        }

        browser.runtime.onMessage.addListener((message: Message) => {
            this.messageHandler.handleMessage(message);
        });

        this.isListening = true;
    }
}
