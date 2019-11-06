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
import * as settingsEvents from '../settings/event';
import * as settingsQueries from '../settings/query';
import * as tabCommands from '../tab/opened-tab/command';
import * as tabEvents from '../tab/opened-tab/event';
import * as tabQueries from '../tab/opened-tab/query';
import * as tabTagCommands from '../tab/tab-tag/command';
import * as tabTagEvents from '../tab/tab-tag/event';
import * as tabTagQueries from '../tab/tab-tag/query';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { PerGroupTaskSchedulerFactory } from '../utils/per-group-task-scheduler';
import { sleep } from '../utils/sleep';
import { TaskSchedulerFactory } from '../utils/task-scheduler';
import { CloseContextMenus } from './components/command/close-context-menus';
import { ContextMenuFactory } from './components/context-menu';
import { ContextMenuOverlay } from './components/context-menu-overlay';
import { CurrentlyVisibleContextMenuCloser } from './components/currently-visible-context-menu-closer';
import { ContextMenuClosed } from './components/event/context-menu-closed';
import { ContextMenuOpened } from './components/event/context-menu-opened';
import { SidenavFactory } from './ui-small/sidenav';
import { SidenavTabTagFilterFactory } from './ui-small/sidenav/sidenav-tab-tag-filter';
import { SidenavTabTagListFactory } from './ui-small/sidenav/sidenav-tab-tag-list';
import { TabTagContextMenuFactory } from './ui-small/sidenav/tab-tag-context-menu';
import { TabTagEntryFactory } from './ui-small/sidenav/tab-tag-entry';
import { TabTagAssignEntryFactory } from './ui-small/tab-tab-assign/tab-tag-assign-entry';
import { TabTagAssignFilterFactory } from './ui-small/tab-tab-assign/tab-tag-assign-filter';
import { TabTagAssignFactory } from './ui-small/tab-tag-assign';
import { TabTagEditFormFactory } from './ui-small/tab-tag-edit-form';
import { TabsViewFactory } from './ui-small/tabs-view';
import { NewTabButtonFactory } from './ui-small/tabs-view/new-tab-button';
import { SelectedTabsActionsFactory } from './ui-small/tabs-view/selected-tabs-actions';
import { SelectedTabsActionsContextMenuFactory } from './ui-small/tabs-view/selected-tabs-actions-context-menu';
import { TabFactory } from './ui-small/tabs-view/tab';
import { TabFilterFactory } from './ui-small/tabs-view/tab-filter';
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
        objectUnserializer.addSupportedClassesFromImportObject(tabTagCommands);
        objectUnserializer.addSupportedClassesFromImportObject(tabTagEvents);
        objectUnserializer.addSupportedClassesFromImportObject(tabTagQueries);
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
        queryBus.register(tabQueries.GetOpenedTabById, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetOpenedTabIdsThatMatchFilter, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetOpenedTabs, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabQueries.GetTabCountForAllTags, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

        queryBus.register(tabTagQueries.GetTabTagById, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabTagQueries.GetTabTagIdsThatMatchFilter, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(tabTagQueries.GetTabTags, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

        queryBus.register(settingsQueries.GetSettings, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
        queryBus.register(GetBackgroundState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    }

    function initCommandBus() {
        commandBus.register(tabCommands.AddTabTagToOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.CloseOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.DiscardOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.DuplicateOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.FocusOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.MoveOpenedTabs, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.MuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.OpenTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.PinOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.ReloadOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.RemoveTabTagFromOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.UnpinOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabCommands.UnmuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);

        commandBus.register(tabTagCommands.CreateTabTag, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabTagCommands.DeleteTabTag, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
        commandBus.register(tabTagCommands.UpdateTabTag, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
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
        const taskSchedulerFactory = new TaskSchedulerFactory(logger);
        const perTabTaskSchedulerFactory = new PerGroupTaskSchedulerFactory(logger);

        const tabContextMenuFactory = new TabContextMenuFactory(commandBus, contextMenuFactory);
        const tabFactory = new TabFactory(detectedBrowser, commandBus, tabContextMenuFactory, defaultFaviconUrl);
        const tabFilterFactory = new TabFilterFactory(queryBus);
        const tabListFactory = new TabListFactory(eventBus, tabFactory, !!window.isTestEnvironment);
        const newTabButtonFactory = new NewTabButtonFactory(commandBus);
        const selectedTabsActionsContextMenuFactory = new SelectedTabsActionsContextMenuFactory(commandBus, queryBus, contextMenuFactory, document.querySelector('.selected-tabs-actions-context-menu-container'));
        const selectedTabsActionsFactory = new SelectedTabsActionsFactory(selectedTabsActionsContextMenuFactory);
        const tabsViewFactory = new TabsViewFactory(tabListFactory, tabFilterFactory, newTabButtonFactory, selectedTabsActionsFactory, perTabTaskSchedulerFactory, commandBus, eventBus, queryBus);

        const tabTagContextMenuFactory = new TabTagContextMenuFactory(commandBus, contextMenuFactory);
        const tabTagEntryFactory = new TabTagEntryFactory(tabTagContextMenuFactory);
        const sidenavTabTagFilterFactory = new SidenavTabTagFilterFactory(queryBus);
        const sidenavTabTagListFactory = new SidenavTabTagListFactory(commandBus, eventBus, queryBus, sidenavTabTagFilterFactory, tabTagEntryFactory, taskSchedulerFactory);
        const sidenavFactory = new SidenavFactory(commandBus, sidenavTabTagListFactory);

        const tabTagEditFormFactory = new TabTagEditFormFactory(commandBus, queryBus);
        const tabTagAssignEntryFactory = new TabTagAssignEntryFactory();
        const tabTagAssignFilterFactory = new TabTagAssignFilterFactory(queryBus);
        const tabTagAssignFactory = new TabTagAssignFactory(commandBus, eventBus, queryBus, tabTagAssignFilterFactory, tabTagAssignEntryFactory, taskSchedulerFactory);

        const uiSmall = new UiSmall(tabsViewFactory, sidenavFactory, tabTagEditFormFactory, tabTagAssignFactory);
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
