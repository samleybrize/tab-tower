import { CommandBus } from '../bus/command-bus';
import { EventBus } from '../bus/event-bus';
import { QueryBus } from '../bus/query-bus';
import { BrowserConsoleLogger } from '../logger/browser-console-logger';
import { BidirectionalQueryMessageHandler } from '../message/bidirectional-query-message-handler';
import { ContentMessageReceiver } from '../message/receiver/content-message-receiver';
import { ReceivedCommandMessageHandler } from '../message/receiver/received-command-message-handler';
import { ReceivedEventMessageHandler } from '../message/receiver/received-event-message-handler';
import { ReceivedMessageHandler } from '../message/receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from '../message/receiver/received-query-message-handler';
import { BackgroundMessageSender } from '../message/sender/background-message-sender';
import { SendMessageEventHandler } from '../message/sender/send-message-event-handler';
import { SendMessageQueryHandler } from '../message/sender/send-message-query-handler';
import { PostUpdateMigrator } from '../migration/post-update-migrator';
import * as settingsCommands from '../settings/command';
import * as settingsEvents from '../settings/event';
import * as settingsQueries from '../settings/query';
import { SettingsModifier } from '../settings/settings-modifier';
import { SettingsRetriever } from '../settings/settings-retriever';
import { WebStorageSettingsPersister } from '../settings/web-storage-settings-persister';
import { NativeTabEventHandler } from '../tab/opened-tab/browser/native-tab-event-handler';
import { NativeTabIdAssociationMaintainerFirefox } from '../tab/opened-tab/browser/native-tab-id-association-maintainer-firefox';
import { OpenedTabCloser } from '../tab/opened-tab/browser/opened-tab-closer';
import { OpenedTabDuplicator } from '../tab/opened-tab/browser/opened-tab-duplicator';
import { OpenedTabFocuser } from '../tab/opened-tab/browser/opened-tab-focuser';
import { OpenedTabMover } from '../tab/opened-tab/browser/opened-tab-mover';
import { OpenedTabMuter } from '../tab/opened-tab/browser/opened-tab-muter';
import { OpenedTabPinner } from '../tab/opened-tab/browser/opened-tab-pinner';
import { OpenedTabReloader } from '../tab/opened-tab/browser/opened-tab-reloader';
import { OpenedTabUnmuter } from '../tab/opened-tab/browser/opened-tab-unmuter';
import { OpenedTabUnpinner } from '../tab/opened-tab/browser/opened-tab-unpinner';
import * as openedTabCommands from '../tab/opened-tab/command';
import * as openedTabEvents from '../tab/opened-tab/event';
import { OpenedTabFilterer } from '../tab/opened-tab/opened-tab-filterer';
import { OpenedTabRetriever } from '../tab/opened-tab/opened-tab-retriever';
import * as openedTabQueries from '../tab/opened-tab/query';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { TaskScheduler } from '../utils/task-scheduler';
import { BackgroundStateRetriever } from './background-state-retriever';
import { GetBackgroundState } from './get-background-state';

async function main() {
    const logger = new BrowserConsoleLogger();
    const commandBus = new CommandBus(logger);
    const eventBus = new EventBus(logger);
    const queryBus = new QueryBus(logger);

    const backgroundStateRetriever = new BackgroundStateRetriever();
    queryBus.register(GetBackgroundState, backgroundStateRetriever.queryBackgroundState, backgroundStateRetriever);

    const postUpdateMigrator = new PostUpdateMigrator();
    await postUpdateMigrator.migrate();

    const nativeTabIdAssociationMaintainer = new NativeTabIdAssociationMaintainerFirefox();
    const nativeTabEventHandler = new NativeTabEventHandler(eventBus, queryBus, nativeTabIdAssociationMaintainer, new TaskScheduler(logger), logger);
    const openedTabFilterer = new OpenedTabFilterer(queryBus);
    const openedTabRetriever = new OpenedTabRetriever(nativeTabEventHandler, openedTabFilterer, new TaskScheduler(logger));

    const openedTabCloser = new OpenedTabCloser(queryBus, nativeTabIdAssociationMaintainer);
    const openedTabDuplicator = new OpenedTabDuplicator(nativeTabIdAssociationMaintainer);
    const openedTabFocuser = new OpenedTabFocuser(nativeTabIdAssociationMaintainer);
    const openedTabMover = new OpenedTabMover(nativeTabIdAssociationMaintainer);
    const openedTabMuter = new OpenedTabMuter(nativeTabIdAssociationMaintainer);
    const openedTabPinner = new OpenedTabPinner(nativeTabIdAssociationMaintainer);
    const openedTabReloader = new OpenedTabReloader(nativeTabIdAssociationMaintainer);
    const openedTabUnmuter = new OpenedTabUnmuter(nativeTabIdAssociationMaintainer);
    const openedTabUnpinner = new OpenedTabUnpinner(nativeTabIdAssociationMaintainer);

    const settingsPersister = new WebStorageSettingsPersister();
    const settingsRetriever = new SettingsRetriever(settingsPersister);
    const settingsModifier = new SettingsModifier(eventBus, settingsPersister, new TaskScheduler(logger));

    const objectUnserializer = new ObjectUnserializer();
    const messageSender = new BackgroundMessageSender();
    const sendMessageEventHandler = new SendMessageEventHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    function initMessaging() {
        objectUnserializer.addSupportedClassesFromImportObject(openedTabCommands);
        objectUnserializer.addSupportedClassesFromImportObject(openedTabEvents);
        objectUnserializer.addSupportedClassesFromImportObject(openedTabQueries);
        objectUnserializer.addSupportedClassesFromImportObject(settingsCommands);
        objectUnserializer.addSupportedClassesFromImportObject(settingsEvents);
        objectUnserializer.addSupportedClassesFromImportObject(settingsQueries);
        objectUnserializer.addSupportedClasses([GetBackgroundState]);

        const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
        const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
        let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
        receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);
        const messageReceiver = new ContentMessageReceiver(receivedMessageHandler);

        messageReceiver.listen();
    }

    function initCommandBus() {
        commandBus.register(openedTabCommands.CloseOpenedTab, openedTabCloser.closeTab, openedTabCloser);
        commandBus.register(openedTabCommands.CloseOpenedTabsToTheRight, openedTabCloser.closeTabsToTheRight, openedTabCloser);
        commandBus.register(openedTabCommands.CloseOtherOpenedTabs, openedTabCloser.closeOtherTabs, openedTabCloser);
        commandBus.register(openedTabCommands.DuplicateOpenedTab, openedTabDuplicator.duplicateTab, openedTabDuplicator);
        commandBus.register(openedTabCommands.FocusOpenedTab, openedTabFocuser.focusTab, openedTabFocuser);
        commandBus.register(openedTabCommands.MoveOpenedTabs, openedTabMover.moveOpenedTabs, openedTabMover);
        commandBus.register(openedTabCommands.MuteOpenedTab, openedTabMuter.muteTab, openedTabMuter);
        commandBus.register(openedTabCommands.PinOpenedTab, openedTabPinner.pinTab, openedTabPinner);
        commandBus.register(openedTabCommands.ReloadOpenedTab, openedTabReloader.reloadTab, openedTabReloader);
        commandBus.register(openedTabCommands.UnmuteOpenedTab, openedTabUnmuter.unmuteTab, openedTabUnmuter);
        commandBus.register(openedTabCommands.UnpinOpenedTab, openedTabUnpinner.unpinTab, openedTabUnpinner);

        commandBus.register(settingsCommands.ConfigureCloseTabOnMiddleClick, settingsModifier.configureCloseTabOnMiddleClick, settingsModifier);
        commandBus.register(settingsCommands.ConfigureShowCloseButtonOnTabHover, settingsModifier.configureShowCloseButtonButtonOnTabHover, settingsModifier);
        commandBus.register(settingsCommands.ConfigureShowTabTitleOnSeveralLines, settingsModifier.configureShowTabTitleOnSeveralLines, settingsModifier);
        commandBus.register(settingsCommands.ConfigureShowTabUrlOnSeveralLines, settingsModifier.configureShowTabUrlOnSeveralLines, settingsModifier);
        commandBus.register(settingsCommands.ConfigureTabAddressToShow, settingsModifier.configureTabAddressToShow, settingsModifier);
    }

    function initQueryBus() {
        queryBus.register(openedTabQueries.GetOpenedTabById, openedTabRetriever.queryById, openedTabRetriever);
        queryBus.register(openedTabQueries.GetOpenedTabs, openedTabRetriever.queryAll, openedTabRetriever);
        queryBus.register(openedTabQueries.GetOpenedTabIdsThatMatchFilter, openedTabFilterer.queryOpenedTabIdsThatMatchFilter, openedTabFilterer);

        queryBus.register(settingsQueries.GetSettings, settingsRetriever.querySettings, settingsRetriever);
    }

    function initEventBus() {
        eventBus.subscribe(openedTabEvents.OpenedTabAudibleStateUpdated, openedTabRetriever.onTabAudibleStateUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabAudibleStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabAudioMuteStateUpdated, openedTabRetriever.onTabAudioMuteStateUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabAudioMuteStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabClosed, openedTabRetriever.onTabClose, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabClosed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabDiscardStateUpdated, openedTabRetriever.onTabDiscardStateUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabDiscardStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabFaviconUrlUpdated, openedTabRetriever.onTabFaviconUrlUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabFaviconUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabFocused, openedTabRetriever.onTabFocus, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabFocused, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabIsLoading, openedTabRetriever.onTabLoading, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabIsLoading, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabLoadingIsComplete, openedTabRetriever.onTabLoadingComplete, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabLoadingIsComplete, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabMoved, openedTabRetriever.onTabMove, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabMoved, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabPinStateUpdated, openedTabRetriever.onTabPinStateUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabPinStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabPositionUpdated, openedTabRetriever.onTabPositionUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabPositionUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabTitleUpdated, openedTabRetriever.onTabTitleUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabTitleUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabUnfocused, openedTabRetriever.onTabUnfocus, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabUnfocused, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.OpenedTabUrlUpdated, openedTabRetriever.onTabUrlUpdate, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.OpenedTabUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(openedTabEvents.TabOpened, openedTabRetriever.onTabOpen, openedTabRetriever);
        eventBus.subscribe(openedTabEvents.TabOpened, sendMessageEventHandler.onEvent, sendMessageEventHandler);

        eventBus.subscribe(settingsEvents.CloseTabOnMiddleClickConfigured, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(settingsEvents.ShowCloseButtonOnTabHoverConfigured, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(settingsEvents.ShowTabTitleOnSeveralLinesConfigured, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(settingsEvents.ShowTabUrlOnSeveralLinesConfigured, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(settingsEvents.TabAddressToShowConfigured, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    }

    async function initTabHandling() {
        await openedTabRetriever.init();
        await nativeTabEventHandler.init();
        await nativeTabIdAssociationMaintainer.init();
    }

    async function initBrowserAction() {
        browser.browserAction.onClicked.addListener(async () => {
            // commandBus.handle(new tabCommands.GoToControlCenter()); // TODO open small-ui
        });
    }

    initMessaging();
    initCommandBus();
    initQueryBus();
    initEventBus();
    await initTabHandling();
    await initBrowserAction();
    backgroundStateRetriever.state = 'ready';
}

main();
