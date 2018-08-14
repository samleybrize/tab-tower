import { GetBackgroundState } from '../background/get-background-state';
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
import * as settingsCommands from '../settings/command';
import * as settingsEvents from '../settings/event';
import * as settingsQueries from '../settings/query';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { sleep } from '../utils/sleep';
import { SettingsView } from './settings/settings-view';

async function main() {
    const logger = new BrowserConsoleLogger('ui-settings', 'green');
    const commandBus = new CommandBus(logger);
    const eventBus = new EventBus(logger);
    const queryBus = new QueryBus(logger);

    let sendMessageCommandHandler: SendMessageCommandHandler;
    let bidirectionalQueryMessageHandler: BidirectionalQueryMessageHandler;

    function initMessaging() {
        const objectUnserializer = new ObjectUnserializer();
        objectUnserializer.addSupportedClassesFromImportObject(settingsCommands);
        objectUnserializer.addSupportedClassesFromImportObject(settingsEvents);
        objectUnserializer.addSupportedClassesFromImportObject(settingsQueries);

        const messageSender = new ContentMessageSender(logger);
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
        queryBus.register(settingsQueries.GetSettings, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

        queryBus.register(GetBackgroundState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    }

    function initCommandBus() {
        commandBus.register(settingsCommands.ConfigureCloseTabOnMiddleClick, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(settingsCommands.ConfigureShowCloseButtonOnTabHover, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(settingsCommands.ConfigureShowTabTitleOnSeveralLines, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(settingsCommands.ConfigureShowTabUrlOnSeveralLines, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(settingsCommands.ConfigureTabAddressToShow, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    }

    function initView() {
        const settingsView = new SettingsView(commandBus, queryBus);

        eventBus.subscribe(settingsEvents.CloseTabOnMiddleClickConfigured, settingsView.onCloseTabOnMiddleClickConfigure, settingsView);
        eventBus.subscribe(settingsEvents.ShowCloseButtonOnTabHoverConfigured, settingsView.onShowCloseButtonOnTabHoverConfigure, settingsView);
        eventBus.subscribe(settingsEvents.ShowTabTitleOnSeveralLinesConfigured, settingsView.onShowTabTitleOnSeveralLinesConfigure, settingsView);
        eventBus.subscribe(settingsEvents.ShowTabUrlOnSeveralLinesConfigured, settingsView.onShowTabUrlOnSeveralLinesConfigure, settingsView);
        eventBus.subscribe(settingsEvents.TabAddressToShowConfigured, settingsView.onTabAddressToShowConfigure, settingsView);

        settingsView.init();
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
