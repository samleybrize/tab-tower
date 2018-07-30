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
import { CloseContextMenus } from './components/command/close-context-menus';
import { ContextMenuFactory } from './components/context-menu';
import { ContextMenuOverlay } from './components/context-menu-overlay';
import { CurrentlyVisibleContextMenuCloser } from './components/currently-visible-context-menu-closer';
import { ContextMenuClosed } from './components/event/context-menu-closed';
import { ContextMenuOpened } from './components/event/context-menu-opened';
import { TabsViewFactory } from './ui-small/tabs-view';
import { NewTabButtonFactory } from './ui-small/tabs-view/new-tab-button';
import { SelectedTabsActionsFactory } from './ui-small/tabs-view/selected-tabs-actions';
import { SelectedTabsActionsContextMenuFactory } from './ui-small/tabs-view/selected-tabs-actions-context-menu';
import { TabFactory } from './ui-small/tabs-view/tab';
import { TabFilterfactory } from './ui-small/tabs-view/tab-filter';
import { TabListFactory } from './ui-small/tabs-view/tab-list';
import { TabContextMenuFactory } from './ui-small/tabs-view/tab/tab-context-menu';
import { UiSmall } from './ui-small/ui-small';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

async function main() {
    const logger = new BrowserConsoleLogger('ui-small', 'green');
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
        queryBus.register(tabQueries.GetOpenedTabById, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetOpenedTabIdsThatMatchFilter, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetOpenedTabs, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

        queryBus.register(GetBackgroundState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    }

    function initCommandBus() {
        commandBus.register(tabCommands.CloseOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.DiscardOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.DuplicateOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.FocusOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.MoveOpenedTabs, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.MuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.OpenTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.PinOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.ReloadOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.UnpinOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.UnmuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    }

    function initView() {
        const currentlyVisibleContextMenuCloser = new CurrentlyVisibleContextMenuCloser();
        const contextMenuOverlay = new ContextMenuOverlay(commandBus);

        eventBus.subscribe(ContextMenuClosed, currentlyVisibleContextMenuCloser.onContextMenuClose, currentlyVisibleContextMenuCloser);
        eventBus.subscribe(ContextMenuClosed, contextMenuOverlay.onContextMenuClose, contextMenuOverlay);
        eventBus.subscribe(ContextMenuOpened, currentlyVisibleContextMenuCloser.onContextMenuOpen, currentlyVisibleContextMenuCloser);
        eventBus.subscribe(ContextMenuOpened, contextMenuOverlay.onContextMenuOpen, contextMenuOverlay);

        commandBus.register(CloseContextMenus, currentlyVisibleContextMenuCloser.close, currentlyVisibleContextMenuCloser);

        const detectedBrowser = new DetectedBrowser();
        const contextMenuFactory = new ContextMenuFactory(eventBus);
        const tabContextMenuFactory = new TabContextMenuFactory(commandBus, contextMenuFactory);
        const tabFactory = new TabFactory(detectedBrowser, commandBus, tabContextMenuFactory, defaultFaviconUrl);
        const tabFilterFactory = new TabFilterfactory(eventBus, queryBus);
        const tabListFactory = new TabListFactory(eventBus, tabFactory, !!window.isTestEnvironment);
        const newTabButtonFactory = new NewTabButtonFactory(commandBus);
        const selectedTabsActionsContextMenuFactory = new SelectedTabsActionsContextMenuFactory(commandBus, queryBus, contextMenuFactory, document.querySelector('.selected-tabs-actions-context-menu-container'));
        const selectedTabsActionsFactory = new SelectedTabsActionsFactory(selectedTabsActionsContextMenuFactory);
        const taskSchedulerFactory = new TaskSchedulerFactory(logger);
        const tabsViewFactory = new TabsViewFactory(tabListFactory, tabFilterFactory, newTabButtonFactory, selectedTabsActionsFactory, taskSchedulerFactory, commandBus, eventBus, queryBus);
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
