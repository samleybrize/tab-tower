import { GetBackgroundState } from '../background/get-background-state';
import { CommandBus } from '../bus/command-bus';
import { EventBus } from '../bus/event-bus';
import { QueryBus } from '../bus/query-bus';
import { BidirectionalQueryMessageHandler } from '../message/bidirectional-query-message-handler';
import { BackgroundMessageReceiver } from '../message/receiver/background-message-receiver';
import { ReceivedCommandMessageHandler } from '../message/receiver/received-command-message-handler';
import { ReceivedEventMessageHandler } from '../message/receiver/received-event-message-handler';
import { ReceivedMessageHandler } from '../message/receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from '../message/receiver/received-query-message-handler';
import { ContentMessageSender } from '../message/sender/content-message-sender';
import { SendMessageCommandHandler } from '../message/sender/send-message-command-handler';
import { SendMessageQueryHandler } from '../message/sender/send-message-query-handler';
import * as tabCommands from '../tab/command';
import { GoToControlCenter } from '../tab/command/go-to-control-center';
import * as tabEvents from '../tab/event';
import { FollowTab } from '../tab/followed-tab/command/follow-tab';
import { UnfollowTab } from '../tab/followed-tab/command/unfollow-tab';
import * as tabQueries from '../tab/query';
import { GetTabAssociationByOpenId } from '../tab/tab-association/query/get-tab-association-by-open-id';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { sleep } from '../utils/sleep';
import { BrowserActionView } from './browser-action-view';

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const objectUnserializer = new ObjectUnserializer();
    objectUnserializer.addSupportedClassesFromImportObject(tabCommands);
    objectUnserializer.addSupportedClassesFromImportObject(tabEvents);
    objectUnserializer.addSupportedClassesFromImportObject(tabQueries);

    const messageSender = new ContentMessageSender();
    const sendMessageCommandHandler = new SendMessageCommandHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
    const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
    let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
    receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);

    const messageReceiver = new BackgroundMessageReceiver(receivedMessageHandler);
    messageReceiver.listen();

    commandBus.register(GoToControlCenter, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(FollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(UnfollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);

    queryBus.register(GetBackgroundState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetTabAssociationByOpenId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

    async function initViews() {
        await waitBackgroundReady();

        const browserActionView = new BrowserActionView(commandBus, queryBus, document.querySelector('#browserAction'));
        browserActionView.init();
    }

    async function waitBackgroundReady() {
        while (true) {
            const backgroundState = await queryBus.query(new GetBackgroundState());

            if ('ready' == backgroundState) {
                return;
            }

            await sleep(100);
        }
    }

    await initViews();
}

main();
