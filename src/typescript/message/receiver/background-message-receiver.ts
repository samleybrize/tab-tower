import { Message } from '../message';
import { MessageHandler } from './message-handler';
import { MessageReceiver } from './message-receiver';

export class BackgroundMessageReceiver implements MessageReceiver {
    private isListening = false;

    constructor(private messageHandler: MessageHandler) {
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
