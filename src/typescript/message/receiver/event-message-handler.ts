import { EventBus } from '../../bus/event-bus';
import { ObjectUnserializer } from '../../utils/object-unserializer';
import { Message } from '../message';
import { MessageHandler } from './message-handler';

export class EventMessageHandler implements MessageHandler {
    constructor(private eventBus: EventBus, private objectUnserializer: ObjectUnserializer, private nextMessageHandler?: MessageHandler) {
    }

    async handleMessage(message: Message): Promise<void> {
        if ('event' != message.messageType) {
            return this.handleByNextHandler(message);
        }

        const eventObject = this.objectUnserializer.fromClassNameAndData(message.className, message.data);

        if (eventObject) {
            await this.eventBus.publish(eventObject);
        }
    }

    private handleByNextHandler(message: Message) {
        if (this.nextMessageHandler) {
            return this.nextMessageHandler.handleMessage(message);
        }
    }
}
