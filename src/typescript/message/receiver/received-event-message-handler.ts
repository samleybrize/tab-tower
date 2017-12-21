import { EventBus } from '../../bus/event-bus';
import { ObjectUnserializer } from '../../utils/object-unserializer';
import { Message } from '../message';
import { ReceivedMessageHandler } from './received-message-handler';

export class ReceivedEventMessageHandler implements ReceivedMessageHandler {
    constructor(private eventBus: EventBus, private objectUnserializer: ObjectUnserializer, private nextMessageHandler?: ReceivedMessageHandler) {
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
