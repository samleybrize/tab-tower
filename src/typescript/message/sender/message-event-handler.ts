import { MessageSender } from './message-sender';

export class MessageEventHandler {
    constructor(private messageSender: MessageSender) {
    }

    async onEvent(event: object) {
        await this.messageSender.send({
            messageType: 'event',
            className: event.constructor.name,
            data: event,
        });
    }
}
