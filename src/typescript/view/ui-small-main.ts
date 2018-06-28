import { GetBackgroundState } from '../background/get-background-state';
import { DetectedBrowser } from '../browser/detected-browser';
import { CommandBus } from '../bus/command-bus';
import { EventBus } from '../bus/event-bus';
import { QueryBus } from '../bus/query-bus';
import { BrowserConsoleLogger } from '../logger/browser-console-logger';
import { BidirectionalQueryMessageHandler } from '../message/bidirectional-query-message-handler';
import { BackgroundMessageReceiver } from '../message/receiver/background-message-receiver';
import { ReceivedCommandMessageHandler } from '../message/receiver/received-command-message-handler';
import { ReceivedEventMessageHandler } from '../message/receiver/received-event-message-handler';
import { ReceivedMessageHandler } from '../message/receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from '../message/receiver/received-query-message-handler';
import { ContentMessageSender } from '../message/sender/content-message-sender';
import { SendMessageCommandHandler } from '../message/sender/send-message-command-handler';
import { SendMessageQueryHandler } from '../message/sender/send-message-query-handler';
import * as tabCommands from '../tab/opened-tab/command';
import * as tabEvents from '../tab/opened-tab/event';
import * as tabQueries from '../tab/opened-tab/query';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { sleep } from '../utils/sleep';
import { TaskSchedulerFactory } from '../utils/task-scheduler';
import { TabsViewFactory } from './ui-small/tabs-view';
import { NewTabButtonFactory } from './ui-small/tabs-view/new-tab-button';
import { TabFactory } from './ui-small/tabs-view/tab';
import { TabFilterfactory } from './ui-small/tabs-view/tab-filter';
import { TabListFactory } from './ui-small/tabs-view/tab-list';
import { UiSmall } from './ui-small/ui-small';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

async function main() {
    const logger = new BrowserConsoleLogger();
    const commandBus = new CommandBus(logger);
    const eventBus = new EventBus(logger);
    const queryBus = new QueryBus(logger);

    let sendMessageCommandHandler: SendMessageCommandHandler;
    let bidirectionalQueryMessageHandler: BidirectionalQueryMessageHandler;

    function initMessaging() {
        const objectUnserializer = new ObjectUnserializer();
        objectUnserializer.addSupportedClassesFromImportObject(tabCommands);
        objectUnserializer.addSupportedClassesFromImportObject(tabEvents);
        objectUnserializer.addSupportedClassesFromImportObject(tabQueries);

        const messageSender = new ContentMessageSender();
        const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);
        sendMessageCommandHandler = new SendMessageCommandHandler(messageSender);

        const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
        bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
        let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
        receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);

        const messageReceiver = new BackgroundMessageReceiver(receivedMessageHandler);
        messageReceiver.listen();
    }

    function initQueryBus() {
        queryBus.register(tabQueries.GetOpenedTabById, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetOpenedTabIdsThatMatchFilter, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetOpenedTabs, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

        queryBus.register(GetBackgroundState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    }

    function initCommandBus() {
        commandBus.register(tabCommands.CloseOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.FocusOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.MuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.OpenTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.UnmuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    }

    function initView() {
        const detectedBrowser = new DetectedBrowser();
        const tabFactory = new TabFactory(detectedBrowser, commandBus, defaultFaviconUrl);
        const tabFilterFactory = new TabFilterfactory(eventBus, queryBus);
        const tabListFactory = new TabListFactory(eventBus, tabFactory, !!window.isTestEnvironment);
        const newTabButtonFactory = new NewTabButtonFactory(commandBus);
        const taskSchedulerFactory = new TaskSchedulerFactory(logger);
        const tabsViewFactory = new TabsViewFactory(tabListFactory, tabFilterFactory, newTabButtonFactory, taskSchedulerFactory, eventBus, queryBus);
        const uiSmall = new UiSmall(tabsViewFactory);
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

    initMessaging();
    initCommandBus();
    initQueryBus();
    await waitBackgroundReady();
    initView();
}

main();
