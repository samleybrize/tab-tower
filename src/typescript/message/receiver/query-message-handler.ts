import { Query, QueryBus } from '../../bus/query-bus';
import { ObjectUnserializer } from '../../utils/object-unserializer';
import { Message } from '../message';
import { MessageHandler } from './message-handler';

export class QueryMessageHandler implements MessageHandler {
    constructor(private queryBus: QueryBus, private objectUnserializer: ObjectUnserializer, private nextMessageHandler?: MessageHandler) {
    }

    async handleMessage(message: Message): Promise<void> {
        if ('query' != message.messageType) {
            return this.handleByNextHandler(message);
        }

        const queryObject = this.objectUnserializer.fromClassNameAndData(message.className, message.data) as Query<object>;

        if (queryObject) {
            await this.queryBus.query(queryObject);
        }
    }

    private handleByNextHandler(message: Message) {
        if (this.nextMessageHandler) {
            return this.nextMessageHandler.handleMessage(message);
        }
    }
}
