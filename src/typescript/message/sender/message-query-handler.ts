import { MessageSender } from './message-sender';

export class MessageQueryHandler {
    constructor(private messageSender: MessageSender) {
    }

    async onQuery(query: object) {
        await this.messageSender.send({
            messageType: 'query',
            className: query.constructor.name,
            data: query,
        });
    }
}
