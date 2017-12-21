import { Query, QueryBus } from '../../bus/query-bus';
import { ObjectUnserializer } from '../../utils/object-unserializer';
import { Message } from '../message';

export class ReceivedQueryMessageHandler {
    constructor(private queryBus: QueryBus, private objectUnserializer: ObjectUnserializer) {
    }

    async handleMessage(message: Message): Promise<object> {
        const queryObject = this.objectUnserializer.fromClassNameAndData(message.className, message.data) as Query<object>;

        if (queryObject) {
            return await this.queryBus.query(queryObject);
        }
    }
}
