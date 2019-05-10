import { Message } from '../message';
import { MessageSender } from './message-sender';

export class BackgroundMessageSender implements MessageSender {
    async send(message: Message) {
        try {
            await browser.runtime.sendMessage(message);
        } catch (error) {
            // if no ui is opened, sending the message may fail and throw an exception
        }
    }
}
