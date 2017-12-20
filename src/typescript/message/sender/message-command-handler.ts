import { MessageSender } from './message-sender';

export class MessageCommandHandler {
    constructor(private messageSender: MessageSender) {
    }

    async onCommand(command: object) {
        await this.messageSender.send({
            messageType: 'command',
            className: command.constructor.name,
            data: command,
        });
    }
}
