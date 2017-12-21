import { Query } from '../bus/query-bus';
import { Message } from './message';
import { ReceivedMessageHandler } from './receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from './receiver/received-query-message-handler';
import { SendMessageQueryHandler } from './sender/send-message-query-handler';

type ResultReceiver = (result: object) => void;

export class BidirectionalQueryMessageHandler implements ReceivedMessageHandler {
    private resultReceiverMap = new Map<number, ResultReceiver>();

    constructor(
        private receivedMessageHandler: ReceivedQueryMessageHandler,
        private sendMessageHandler: SendMessageQueryHandler,
        private nextMessageHandler?: ReceivedMessageHandler,
    ) {
    }

    async handleMessage(message: Message): Promise<void> {
        if ('query' == message.messageType) {
            return this.handleQueryMessage(message);
        } else if ('queryResult' == message.messageType) {
            return this.handleQueryResultMessage(message);
        } else {
            return this.handleByNextHandler(message);
        }
    }

    private async handleQueryMessage(message: Message) {
        const result = await this.receivedMessageHandler.handleMessage(message);
        this.sendMessageHandler.sendQueryResult(result, message.requestId);
    }

    private async handleQueryResultMessage(message: Message) {
        const resultReceiver = this.resultReceiverMap.get(message.requestId);

        if (resultReceiver) {
            resultReceiver(message.data);
        }
    }

    private handleByNextHandler(message: Message) {
        if (this.nextMessageHandler) {
            return this.nextMessageHandler.handleMessage(message);
        }
    }

    async onQuery(query: Query<any>): Promise<object> {
        const requestId = Math.random();
        await this.sendMessageHandler.onQuery(query, requestId);

        try {
            const result = await this.getQueryResult(requestId);

            return result;
        } catch (error) {
            console.error(error.message);

            return null;
        }
    }

    private async getQueryResult(requestId: number): Promise<object> {
        return new Promise((resolve, reject) => {
            const timeoutReference = setTimeout(() => {
                reject('Unable to get a response for the query');
            }, 10000);

            const receiveResult = (result: object) => {
                clearTimeout(timeoutReference);
                this.resultReceiverMap.delete(requestId);
                resolve(result);
            };
            this.resultReceiverMap.set(requestId, receiveResult);
        });
    }
}
