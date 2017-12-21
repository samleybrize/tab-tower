import { Query } from '../../bus/query-bus';
import { MessageSender } from './message-sender';

export class SendMessageQueryHandler {
    constructor(private messageSender: MessageSender) {
    }

    async onQuery(query: Query<any>, requestId?: number) {
        await this.messageSender.send({
            requestId,
            messageType: 'query',
            className: query.constructor.name,
            data: query,
        });
    }

    async sendQueryResult(queryResult: object, requestId: number) {
        await this.messageSender.send({
            requestId,
            messageType: 'queryResult',
            className: queryResult.constructor.name,
            data: queryResult,
        });
    }
}
