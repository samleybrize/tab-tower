import { Message } from '../message';

export interface ReceivedMessageHandler {
    handleMessage(message: Message): Promise<void>;
}
