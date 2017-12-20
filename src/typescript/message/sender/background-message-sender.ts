import { Message } from '../message';
import { MessageSender } from './message-sender';

export class BackgroundMessageSender implements MessageSender {
    async send(message: Message) {
        await browser.runtime.sendMessage(message);
    }
}
