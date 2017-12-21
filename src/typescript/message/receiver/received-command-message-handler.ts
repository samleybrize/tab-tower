import { CommandBus } from '../../bus/command-bus';
import { ObjectUnserializer } from '../../utils/object-unserializer';
import { Message } from '../message';
import { ReceivedMessageHandler } from './received-message-handler';

export class ReceivedCommandMessageHandler implements ReceivedMessageHandler {
    constructor(private commandBus: CommandBus, private objectCreator: ObjectUnserializer, private nextMessageHandler?: ReceivedMessageHandler) {
    }

    async handleMessage(message: Message): Promise<void> {
        if ('command' != message.messageType) {
            return this.handleByNextHandler(message);
        }

        const commandObject = this.objectCreator.fromClassNameAndData(message.className, message.data);

        if (commandObject) {
            await this.commandBus.handle(commandObject);
        }
    }

    private handleByNextHandler(message: Message) {
        if (this.nextMessageHandler) {
            return this.nextMessageHandler.handleMessage(message);
        }
    }
}
