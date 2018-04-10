import { BrowserActionBadgeManipulator } from '../browser/browser-action-badge-manipulator';
import { OmniboxSuggestionHandler } from '../browser/omnibox-suggestion-handler';
import { CommandBus } from '../bus/command-bus';
import { EventBus } from '../bus/event-bus';
import { QueryBus } from '../bus/query-bus';
import { ControlCenterOpener } from '../control-center-opener';
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
import * as tabCommands from '../tab/command';
import * as tabEvents from '../tab/event';
import { FollowedTabMover } from '../tab/followed-tab/followed-tab-mover';
import { FollowedTabOpener } from '../tab/followed-tab/followed-tab-opener';
import { FollowedTabRegisterer } from '../tab/followed-tab/followed-tab-registerer';
import { FollowedTabRetriever } from '../tab/followed-tab/followed-tab-retriever';
import { FollowedTabSearcher } from '../tab/followed-tab/followed-tab-searcher';
import { FollowedTabUpdater } from '../tab/followed-tab/followed-tab-updater';
import { FollowedTabWeightCalculator } from '../tab/followed-tab/followed-tab-weight-calculator';
import { OpenedTabFollower } from '../tab/followed-tab/opened-tab-follower';
import { InMemoryFollowStatePersister } from '../tab/followed-tab/persister/in-memory-follow-state-persister';
import { WebStorageFollowStatePersister } from '../tab/followed-tab/persister/web-storage-follow-state-persister';
import { TabUnfollower } from '../tab/followed-tab/tab-unfollower';
import { NativeRecentlyClosedTabAssociationMaintainer } from '../tab/native-recently-closed-tab/native-recently-closed-tab-association-maintainer';
import { WebStoragePersister as WebStorageNativeRecentlyClosedTabAssociationPersister } from '../tab/native-recently-closed-tab/web-storage-persister';
import { NativeTabEventHandler } from '../tab/native-tab-event-handler';
import { ClosedTabRetriever } from '../tab/opened-tab/closed-tab-retriever';
import { OpenedTabCloser } from '../tab/opened-tab/opened-tab-closer';
import { OpenedTabDuplicator } from '../tab/opened-tab/opened-tab-duplicator';
import { OpenedTabFocuser } from '../tab/opened-tab/opened-tab-focuser';
import { OpenedTabMover } from '../tab/opened-tab/opened-tab-mover';
import { OpenedTabMuter } from '../tab/opened-tab/opened-tab-muter';
import { OpenedTabPinner } from '../tab/opened-tab/opened-tab-pinner';
import { OpenedTabReloader } from '../tab/opened-tab/opened-tab-reloader';
import { OpenedTabRetriever } from '../tab/opened-tab/opened-tab-retriever';
import { OpenedTabUnmuter } from '../tab/opened-tab/opened-tab-unmuter';
import { OpenedTabUnpinner } from '../tab/opened-tab/opened-tab-unpinner';
import { OpenedTabWaiter } from '../tab/opened-tab/opened-tab-waiter';
import { PrivilegedUrlDetector } from '../tab/privileged-url-detector';
import * as tabQueries from '../tab/query';
import { InMemoryRecentlyUnfollowedTabPersister } from '../tab/recently-unfollowed-tab/persister/in-memory-recently-unfollowed-tab-persister';
import { WebStorageRecentlyUnfollowedTabPersister } from '../tab/recently-unfollowed-tab/persister/web-storage-recently-unfollowed-tab-persister';
import { RecentlyUnfollowedTabDeleter } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-deleter';
import { RecentlyUnfollowedTabRegisterer } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-registerer';
import { RecentlyUnfollowedTabRestorer } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-restorer';
import { RecentlyUnfollowedTabRetriever } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-retriever';
import { TabAssociationMaintainer } from '../tab/tab-association/tab-association-maintainer';
import { TabAssociationRetriever } from '../tab/tab-association/tab-association-retriever';
import { TabMatcher } from '../tab/tab-matcher';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { StringMatcher } from '../utils/string-matcher';
import { BackgroundStateRetriever } from './background-state-retriever';
import { GetBackgroundState } from './get-background-state';

const controlCenterDesktopLabel = 'Tab Tower Control Center';
const controlCenterDesktopUrl = browser.extension.getURL('/ui/control-center-desktop.html');
const maximumNumberOfRecentlyUnfollowedTabs = window.isTestEnvironment ? window.testConfiguration.maximumNumberOfRecentlyUnfollowedTabs : 100;

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const backgroundStateRetriever = new BackgroundStateRetriever();
    queryBus.register(GetBackgroundState, backgroundStateRetriever.queryBackgroundState, backgroundStateRetriever);

    const postUpdateMigrator = new PostUpdateMigrator();
    await postUpdateMigrator.migrate();

    const stringMatcher = new StringMatcher();
    const tabMatcher = new TabMatcher(stringMatcher);
    const openedTabWaiter = new OpenedTabWaiter();

    const followedTabWeightCalculator = new FollowedTabWeightCalculator();
    const webStorageFollowStateTabPersister = new WebStorageFollowStatePersister();
    const inMemoryFollowStateTabPersister = new InMemoryFollowStatePersister(webStorageFollowStateTabPersister);
    const tabFollower = new OpenedTabFollower(followedTabWeightCalculator, commandBus, queryBus);
    const tabUnfollower = new TabUnfollower(inMemoryFollowStateTabPersister, eventBus);
    const followedTabUpdater = new FollowedTabUpdater(inMemoryFollowStateTabPersister, commandBus, queryBus);
    const followedTabOpener = new FollowedTabOpener(commandBus, queryBus, openedTabWaiter);
    const followedTabRegisterer = new FollowedTabRegisterer(inMemoryFollowStateTabPersister, commandBus, eventBus, queryBus);
    const followedTabRetriever = new FollowedTabRetriever(inMemoryFollowStateTabPersister);
    const followedTabSearcher = new FollowedTabSearcher(queryBus, tabMatcher);

    const webStorageRecentlyUnfollowedTabPersister = new WebStorageRecentlyUnfollowedTabPersister();
    const inMemoryRecentlyUnfollowedTabPersister = new InMemoryRecentlyUnfollowedTabPersister(webStorageRecentlyUnfollowedTabPersister);
    const recentlyUnfollowedTabDeleter = new RecentlyUnfollowedTabDeleter(eventBus, queryBus, inMemoryRecentlyUnfollowedTabPersister, maximumNumberOfRecentlyUnfollowedTabs);
    const recentlyUnfollowedTabRegisterer = new RecentlyUnfollowedTabRegisterer(eventBus, inMemoryRecentlyUnfollowedTabPersister);
    const recentlyUnfollowedTabRestorer = new RecentlyUnfollowedTabRestorer(commandBus, queryBus);
    const recentlyUnfollowedTabRetriever = new RecentlyUnfollowedTabRetriever(inMemoryRecentlyUnfollowedTabPersister);

    const privilegedUrlDetector = new PrivilegedUrlDetector();
    const openedTabRetriever = new OpenedTabRetriever(privilegedUrlDetector, [controlCenterDesktopUrl]);
    const closedTabRetriever = new ClosedTabRetriever(queryBus);

    const nativeRecentlyClosedTabAssociationPersister = new WebStorageNativeRecentlyClosedTabAssociationPersister();
    const nativeRecentlyClosedTabAssociationMaintainer = new NativeRecentlyClosedTabAssociationMaintainer(nativeRecentlyClosedTabAssociationPersister);

    const browserActionBadgeManipulator = new BrowserActionBadgeManipulator(queryBus);
    const omniboxSuggestionHandler = new OmniboxSuggestionHandler(commandBus, queryBus, controlCenterDesktopLabel);

    const tabAssociationMaintainer = new TabAssociationMaintainer(eventBus, queryBus);
    const tabAssociationRetriever = new TabAssociationRetriever(queryBus);

    const controlCenterOpener = new ControlCenterOpener(controlCenterDesktopUrl);
    const followedTabMover = new FollowedTabMover(inMemoryFollowStateTabPersister, followedTabWeightCalculator, eventBus);
    const openedTabMover = new OpenedTabMover();
    const tabCloser = new OpenedTabCloser();
    const tabDuplicator = new OpenedTabDuplicator();
    const tabFocuser = new OpenedTabFocuser();
    const tabMuter = new OpenedTabMuter();
    const tabPinner = new OpenedTabPinner();
    const tabReloader = new OpenedTabReloader();
    const tabUnmuter = new OpenedTabUnmuter();
    const tabUnpinner = new OpenedTabUnpinner();
    const nativeEventHandler = new NativeTabEventHandler(eventBus, queryBus, tabCloser, openedTabWaiter);

    const objectUnserializer = new ObjectUnserializer();
    const messageSender = new BackgroundMessageSender();
    const sendMessageEventHandler = new SendMessageEventHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    function initMessaging() {
        objectUnserializer.addSupportedClassesFromImportObject(tabCommands);
        objectUnserializer.addSupportedClassesFromImportObject(tabEvents);
        objectUnserializer.addSupportedClassesFromImportObject(tabQueries);
        objectUnserializer.addSupportedClasses([GetBackgroundState]);

        const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
        const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
        let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
        receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);
        const messageReceiver = new ContentMessageReceiver(receivedMessageHandler);

        messageReceiver.listen();
    }

    function initCommandBus() {
        commandBus.register(tabCommands.AssociateOpenedTabToFollowedTab, tabAssociationMaintainer.associateOpenedTabToFollowedTab, tabAssociationMaintainer);
        commandBus.register(tabCommands.CloseOpenedTab, tabCloser.closeTab, tabCloser);
        commandBus.register(tabCommands.DeleteRecentlyUnfollowedTab, recentlyUnfollowedTabDeleter.delete, recentlyUnfollowedTabDeleter);
        commandBus.register(tabCommands.DuplicateOpenedTab, tabDuplicator.duplicateTab, tabDuplicator);
        commandBus.register(tabCommands.FocusOpenedTab, tabFocuser.focusTab, tabFocuser);
        commandBus.register(tabCommands.FollowTab, tabFollower.followTab, tabFollower);
        commandBus.register(tabCommands.GoToControlCenter, controlCenterOpener.goToControlCenter, controlCenterOpener);
        commandBus.register(tabCommands.MoveFollowedTabs, followedTabMover.moveFollowedTabs, followedTabMover);
        commandBus.register(tabCommands.MoveOpenedTabs, openedTabMover.moveOpenedTabs, openedTabMover);
        commandBus.register(tabCommands.MuteOpenedTab, tabMuter.muteTab, tabMuter);
        commandBus.register(tabCommands.PinOpenedTab, tabPinner.pinTab, tabPinner);
        commandBus.register(tabCommands.RegisterTabFollowState, followedTabRegisterer.registerFollowedTab, followedTabRegisterer);
        commandBus.register(tabCommands.ReloadOpenedTab, tabReloader.reloadTab, tabReloader);
        commandBus.register(tabCommands.RestoreFollowedTab, followedTabOpener.restoreFollowedTab, followedTabOpener);
        commandBus.register(tabCommands.RestoreRecentlyUnfollowedTab, recentlyUnfollowedTabRestorer.restoreRecentlyUnfollowedTab, recentlyUnfollowedTabRestorer);
        commandBus.register(tabCommands.UnfollowTab, tabUnfollower.unfollowTab, tabUnfollower);
        commandBus.register(tabCommands.UnmuteOpenedTab, tabUnmuter.unmuteTab, tabUnmuter);
        commandBus.register(tabCommands.UnpinOpenedTab, tabUnpinner.unpinTab, tabUnpinner);
    }

    function initQueryBus() {
        queryBus.register(tabQueries.GetClosedTabOpenStateByOpenId, closedTabRetriever.queryById, closedTabRetriever);
        queryBus.register(tabQueries.GetFollowIdAssociatedToOpenId, tabAssociationMaintainer.queryAssociatedFollowId, tabAssociationMaintainer);
        queryBus.register(tabQueries.GetOpenIdAssociatedToFollowId, tabAssociationMaintainer.queryAssociatedOpenId, tabAssociationMaintainer);
        queryBus.register(tabQueries.GetRecentlyUnfollowedTabByFollowId, recentlyUnfollowedTabRetriever.queryByFollowId, recentlyUnfollowedTabRetriever);
        queryBus.register(tabQueries.GetRecentlyUnfollowedTabs, recentlyUnfollowedTabRetriever.queryAll, recentlyUnfollowedTabRetriever);
        queryBus.register(tabQueries.GetSessionIdAssociatedToOpenLongLivedId, nativeRecentlyClosedTabAssociationMaintainer.querySessionIdAssociatedToOpenLongLivedId, nativeRecentlyClosedTabAssociationMaintainer);
        queryBus.register(tabQueries.GetTabAssociationsWithFollowState, tabAssociationRetriever.queryFollowedTabs, tabAssociationRetriever);
        queryBus.register(tabQueries.GetTabAssociationsWithOpenState, tabAssociationRetriever.queryOpenedTabs, tabAssociationRetriever);
        queryBus.register(tabQueries.GetTabAssociationByFollowId, tabAssociationRetriever.queryByFollowId, tabAssociationRetriever);
        queryBus.register(tabQueries.GetTabAssociationByOpenId, tabAssociationRetriever.queryByOpenId, tabAssociationRetriever);
        queryBus.register(tabQueries.GetTabFollowStateByFollowId, followedTabRetriever.queryById, followedTabRetriever);
        queryBus.register(tabQueries.GetTabFollowStateWeightList, followedTabRetriever.queryWeightList, followedTabRetriever);
        queryBus.register(tabQueries.GetTabFollowStates, followedTabRetriever.queryAll, followedTabRetriever);
        queryBus.register(tabQueries.GetTabFollowStatesWithOpenLongLivedId, followedTabRetriever.queryAllWithOpenLongLivedId, followedTabRetriever);
        queryBus.register(tabQueries.GetTabOpenStateByOpenId, openedTabRetriever.queryById, openedTabRetriever);
        queryBus.register(tabQueries.GetTabOpenStateByOpenLongLivedId, openedTabRetriever.queryByLongLivedId, openedTabRetriever);
        queryBus.register(tabQueries.GetTabOpenStates, openedTabRetriever.queryAll, openedTabRetriever);
        queryBus.register(tabQueries.SearchTabFollowStates, followedTabSearcher.searchFollowStates, followedTabSearcher);
    }

    function initEventBus() {
        eventBus.subscribe(tabEvents.FollowedTabMoved, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabClosed, nativeRecentlyClosedTabAssociationMaintainer.onTabClose, nativeRecentlyClosedTabAssociationMaintainer);
        eventBus.subscribe(tabEvents.OpenedTabClosed, openedTabRetriever.onTabClose, openedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabClosed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabClosed, tabAssociationMaintainer.onTabClose, tabAssociationMaintainer);
        eventBus.subscribe(tabEvents.OpenedTabCloseHandled, closedTabRetriever.onTabCloseHandled, closedTabRetriever);
        eventBus.subscribe(tabEvents.TabOpened, closedTabRetriever.onTabOpen, closedTabRetriever);
        eventBus.subscribe(tabEvents.TabOpened, followedTabUpdater.onTabOpen, followedTabUpdater);
        eventBus.subscribe(tabEvents.TabOpened, openedTabRetriever.onTabOpen, openedTabRetriever);
        eventBus.subscribe(tabEvents.TabOpened, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabFollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabAssociatedToFollowedTab, browserActionBadgeManipulator.onAssociateOpenedTabToFollowedTab, browserActionBadgeManipulator);
        eventBus.subscribe(tabEvents.OpenedTabAssociatedToFollowedTab, followedTabUpdater.onAssociateOpenedTabToFollowedTab, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabAssociatedToFollowedTab, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabAudibleStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabAudioMuteStateUpdated, followedTabUpdater.onOpenedTabAudioMuteStateUpdate, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabAudioMuteStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabFaviconUrlUpdated, followedTabUpdater.onOpenedTabFaviconUrlUpdate, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabFaviconUrlUpdated, closedTabRetriever.onTabFaviconUrlUpdate, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabFaviconUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabFocused, closedTabRetriever.onTabFocus, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabFocused, followedTabUpdater.onOpenedTabFocus, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabFocused, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabMoved, closedTabRetriever.onTabMove, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabMoved, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabPinStateUpdated, closedTabRetriever.onTabPinStateUpdate, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabPinStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabReaderModeStateUpdated, followedTabUpdater.onOpenedTabReaderModeStateUpdate, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabReaderModeStateUpdated, closedTabRetriever.onTabReaderModeStateUpdate, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabReaderModeStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabTitleUpdated, followedTabUpdater.onOpenedTabTitleUpdate, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabTitleUpdated, closedTabRetriever.onTabTitleUpdate, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabTitleUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.OpenedTabUrlUpdated, browserActionBadgeManipulator.onOpenedTabUrlUpdate, browserActionBadgeManipulator);
        eventBus.subscribe(tabEvents.OpenedTabUrlUpdated, followedTabUpdater.onOpenedTabUrlUpdate, followedTabUpdater);
        eventBus.subscribe(tabEvents.OpenedTabUrlUpdated, closedTabRetriever.onTabUrlUpdate, closedTabRetriever);
        eventBus.subscribe(tabEvents.OpenedTabUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.RecentlyUnfollowedTabAdded, recentlyUnfollowedTabDeleter.onRecentlyUnfollowedTabAdd, recentlyUnfollowedTabDeleter);
        eventBus.subscribe(tabEvents.RecentlyUnfollowedTabAdded, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.RecentlyUnfollowedTabDeleted, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.TabUnfollowed, browserActionBadgeManipulator.onTabUnfollow, browserActionBadgeManipulator);
        eventBus.subscribe(tabEvents.TabUnfollowed, recentlyUnfollowedTabRegisterer.onTabUnfollow, recentlyUnfollowedTabRegisterer);
        eventBus.subscribe(tabEvents.TabUnfollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(tabEvents.TabUnfollowed, tabAssociationMaintainer.onTabUnfollow, tabAssociationMaintainer);
    }

    async function initTabHandling() {
        await openedTabRetriever.init();
        await closedTabRetriever.init();
        await nativeRecentlyClosedTabAssociationMaintainer.init();
        nativeEventHandler.init();
        await tabAssociationMaintainer.associateOpenedTabsWithFollowedTabs();
    }

    async function initBrowserAction() {
        browser.browserAction.onClicked.addListener(async () => {
            commandBus.handle(new tabCommands.GoToControlCenter());
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
