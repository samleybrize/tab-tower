import { BrowserActionBadge } from '../browser/browser-action-badge';
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
import { AssociateOpenedTabToFollowedTab } from '../tab/command/associate-opened-tab-to-followed-tab';
import { CloseOpenedTab } from '../tab/command/close-opened-tab';
import { DeleteRecentlyUnfollowedTab } from '../tab/command/delete-recently-unfollowed-tab';
import { DuplicateOpenedTab } from '../tab/command/duplicate-opened-tab';
import { FocusOpenedTab } from '../tab/command/focus-opened-tab';
import { FollowTab } from '../tab/command/follow-tab';
import { GoToControlCenter } from '../tab/command/go-to-control-center';
import { MoveFollowedTabs } from '../tab/command/move-followed-tabs';
import { MoveOpenedTabs } from '../tab/command/move-opened-tabs';
import { MuteOpenedTab } from '../tab/command/mute-opened-tab';
import { PinOpenedTab } from '../tab/command/pin-opened-tab';
import { RegisterTabFollowState } from '../tab/command/register-tab-follow-state';
import { ReloadOpenedTab } from '../tab/command/reload-opened-tab';
import { RestoreFollowedTab } from '../tab/command/restore-followed-tab';
import { RestoreRecentlyUnfollowedTab } from '../tab/command/restore-recently-unfollowed-tab';
import { tabCommands } from '../tab/command/tab-commands';
import { UnfollowTab } from '../tab/command/unfollow-tab';
import { UnmuteOpenedTab } from '../tab/command/unmute-opened-tab';
import { UnpinOpenedTab } from '../tab/command/unpin-opened-tab';
import { FollowedTabMoved } from '../tab/event/followed-tab-moved';
import { OpenedTabAssociatedToFollowedTab } from '../tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabAudibleStateUpdated } from '../tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from '../tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabCloseHandled } from '../tab/event/opened-tab-close-handled';
import { OpenedTabClosed } from '../tab/event/opened-tab-closed';
import { OpenedTabFaviconUrlUpdated } from '../tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from '../tab/event/opened-tab-focused';
import { OpenedTabFollowed } from '../tab/event/opened-tab-followed';
import { OpenedTabMoved } from '../tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from '../tab/event/opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from '../tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from '../tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from '../tab/event/opened-tab-url-updated';
import { RecentlyUnfollowedTabAdded } from '../tab/event/recently-unfollowed-tab-added';
import { RecentlyUnfollowedTabDeleted } from '../tab/event/recently-unfollowed-tab-deleted';
import { tabEvents } from '../tab/event/tab-events';
import { TabOpened } from '../tab/event/tab-opened';
import { TabUnfollowed } from '../tab/event/tab-unfollowed';
import { FollowedTabMover } from '../tab/followed-tab/followed-tab-mover';
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
import { OpenedTabCloser } from '../tab/opened-tab-closer';
import { OpenedTabDuplicator } from '../tab/opened-tab-duplicator';
import { OpenedTabFocuser } from '../tab/opened-tab-focuser';
import { OpenedTabMuter } from '../tab/opened-tab-muter';
import { OpenedTabPinner } from '../tab/opened-tab-pinner';
import { OpenedTabReloader } from '../tab/opened-tab-reloader';
import { OpenedTabUnmuter } from '../tab/opened-tab-unmuter';
import { OpenedTabUnpinner } from '../tab/opened-tab-unpinner';
import { ClosedTabRetriever } from '../tab/opened-tab/closed-tab-retriever';
import { OpenedTabMover } from '../tab/opened-tab/opened-tab-mover';
import { OpenedTabRetriever } from '../tab/opened-tab/opened-tab-retriever';
import { PrivilegedUrlDetector } from '../tab/privileged-url-detector';
import { GetClosedTabOpenStateByOpenId } from '../tab/query/get-closed-tab-open-state-by-open-id';
import { GetFollowIdAssociatedToOpenId } from '../tab/query/get-follow-id-associated-to-open-id';
import { GetOpenIdAssociatedToFollowId } from '../tab/query/get-open-id-associated-to-follow-id';
import { GetRecentlyUnfollowedTabs } from '../tab/query/get-recently-unfollowed-tabs';
import { GetRecentlyUnfollowedTabByFollowId } from '../tab/query/get-recently-unfollowed-tabs-by-follow-id';
import { GetSessionIdAssociatedToOpenLongLivedId } from '../tab/query/get-session-id-associated-to-open-long-lived-id';
import { GetTabAssociationByFollowId } from '../tab/query/get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from '../tab/query/get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from '../tab/query/get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from '../tab/query/get-tab-associations-with-open-state';
import { GetTabFollowStateByFollowId } from '../tab/query/get-tab-follow-state-by-follow-id';
import { GetTabFollowStateWeightList } from '../tab/query/get-tab-follow-state-weight-list';
import { GetTabFollowStates } from '../tab/query/get-tab-follow-states';
import { GetTabFollowStatesWithOpenLongLivedId } from '../tab/query/get-tab-follow-states-with-open-long-lived-id';
import { GetTabOpenStateByOpenId } from '../tab/query/get-tab-open-state-by-open-id';
import { GetTabOpenStateByOpenLongLivedId } from '../tab/query/get-tab-open-state-by-open-long-lived-id';
import { GetTabOpenStates } from '../tab/query/get-tab-open-states';
import { SearchTabFollowStates } from '../tab/query/search-tab-follow-states';
import { tabQueries } from '../tab/query/tab-queries';
import { InMemoryRecentlyUnfollowedTabPersister } from '../tab/recently-unfollowed-tab/persister/in-memory-recently-unfollowed-tab-persister';
import { WebStorageRecentlyUnfollowedTabPersister } from '../tab/recently-unfollowed-tab/persister/web-storage-recently-unfollowed-tab-persister';
import { RecentlyUnfollowedTabDeleter } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-deleter';
import { RecentlyUnfollowedTabInserter } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-inserter';
import { RecentlyUnfollowedTabRestorer } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-restorer';
import { RecentlyUnfollowedTabRetriever } from '../tab/recently-unfollowed-tab/recently-unfollowed-tab-retriever';
import { TabAssociationMaintainer } from '../tab/tab-association/tab-association-maintainer';
import { TabAssociationRetriever } from '../tab/tab-association/tab-association-retriever';
import { TabMatcher } from '../tab/tab-matcher';
import { TabOpener } from '../tab/tab-opener';
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

    const followedTabWeightCalculator = new FollowedTabWeightCalculator();
    const webStorageFollowStateTabPersister = new WebStorageFollowStatePersister();
    const inMemoryFollowStateTabPersister = new InMemoryFollowStatePersister(webStorageFollowStateTabPersister);
    const tabFollower = new OpenedTabFollower(followedTabWeightCalculator, commandBus, queryBus);
    const tabUnfollower = new TabUnfollower(inMemoryFollowStateTabPersister, eventBus);
    const followedTabUpdater = new FollowedTabUpdater(inMemoryFollowStateTabPersister, commandBus, queryBus);
    const followedTabRegisterer = new FollowedTabRegisterer(inMemoryFollowStateTabPersister, commandBus, eventBus, queryBus);
    const followedTabRetriever = new FollowedTabRetriever(inMemoryFollowStateTabPersister);
    const followedTabSearcher = new FollowedTabSearcher(queryBus, tabMatcher);

    const webStorageRecentlyUnfollowedTabPersister = new WebStorageRecentlyUnfollowedTabPersister();
    const inMemoryRecentlyUnfollowedTabPersister = new InMemoryRecentlyUnfollowedTabPersister(webStorageRecentlyUnfollowedTabPersister);
    const recentlyUnfollowedTabDeleter = new RecentlyUnfollowedTabDeleter(eventBus, queryBus, inMemoryRecentlyUnfollowedTabPersister, maximumNumberOfRecentlyUnfollowedTabs);
    const recentlyUnfollowedTabInserter = new RecentlyUnfollowedTabInserter(eventBus, inMemoryRecentlyUnfollowedTabPersister);
    const recentlyUnfollowedTabRestorer = new RecentlyUnfollowedTabRestorer(commandBus, queryBus);
    const recentlyUnfollowedTabRetriever = new RecentlyUnfollowedTabRetriever(inMemoryRecentlyUnfollowedTabPersister);

    const privilegedUrlDetector = new PrivilegedUrlDetector();
    const openedTabRetriever = new OpenedTabRetriever(privilegedUrlDetector, [controlCenterDesktopUrl]);
    const closedTabRetriever = new ClosedTabRetriever(queryBus);
    const tabOpener = new TabOpener(commandBus, queryBus);

    const nativeRecentlyClosedTabAssociationPersister = new WebStorageNativeRecentlyClosedTabAssociationPersister();
    const nativeRecentlyClosedTabAssociationMaintainer = new NativeRecentlyClosedTabAssociationMaintainer(nativeRecentlyClosedTabAssociationPersister);

    const browserActionBadge = new BrowserActionBadge(queryBus);
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
    const nativeEventHandler = new NativeTabEventHandler(eventBus, queryBus, tabCloser, tabOpener);

    const objectUnserializer = new ObjectUnserializer();
    const messageSender = new BackgroundMessageSender();
    const sendMessageEventHandler = new SendMessageEventHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    function initMessaging() {
        objectUnserializer.addSupportedClasses(tabCommands);
        objectUnserializer.addSupportedClasses(tabEvents);
        objectUnserializer.addSupportedClasses(tabQueries);
        objectUnserializer.addSupportedClasses([GetBackgroundState]);

        const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
        const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
        let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
        receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);
        const messageReceiver = new ContentMessageReceiver(receivedMessageHandler);

        messageReceiver.listen();
    }

    function initCommandBus() {
        commandBus.register(AssociateOpenedTabToFollowedTab, tabAssociationMaintainer.associateOpenedTabToFollowedTab, tabAssociationMaintainer);
        commandBus.register(CloseOpenedTab, tabCloser.closeTab, tabCloser);
        commandBus.register(DeleteRecentlyUnfollowedTab, recentlyUnfollowedTabDeleter.delete, recentlyUnfollowedTabDeleter);
        commandBus.register(DuplicateOpenedTab, tabDuplicator.duplicateTab, tabDuplicator);
        commandBus.register(FocusOpenedTab, tabFocuser.focusTab, tabFocuser);
        commandBus.register(FollowTab, tabFollower.followTab, tabFollower);
        commandBus.register(GoToControlCenter, controlCenterOpener.goToControlCenter, controlCenterOpener);
        commandBus.register(MoveFollowedTabs, followedTabMover.moveFollowedTabs, followedTabMover);
        commandBus.register(MoveOpenedTabs, openedTabMover.moveOpenedTabs, openedTabMover);
        commandBus.register(MuteOpenedTab, tabMuter.muteTab, tabMuter);
        commandBus.register(PinOpenedTab, tabPinner.pinTab, tabPinner);
        commandBus.register(RegisterTabFollowState, followedTabRegisterer.registerFollowedTab, followedTabRegisterer);
        commandBus.register(ReloadOpenedTab, tabReloader.reloadTab, tabReloader);
        commandBus.register(RestoreFollowedTab, tabOpener.restoreFollowedTab, tabOpener);
        commandBus.register(RestoreRecentlyUnfollowedTab, recentlyUnfollowedTabRestorer.restoreRecentlyUnfollowedTab, recentlyUnfollowedTabRestorer);
        commandBus.register(UnfollowTab, tabUnfollower.unfollowTab, tabUnfollower);
        commandBus.register(UnmuteOpenedTab, tabUnmuter.unmuteTab, tabUnmuter);
        commandBus.register(UnpinOpenedTab, tabUnpinner.unpinTab, tabUnpinner);
    }

    function initQueryBus() {
        queryBus.register(GetClosedTabOpenStateByOpenId, closedTabRetriever.queryById, closedTabRetriever);
        queryBus.register(GetFollowIdAssociatedToOpenId, tabAssociationMaintainer.queryAssociatedFollowId, tabAssociationMaintainer);
        queryBus.register(GetOpenIdAssociatedToFollowId, tabAssociationMaintainer.queryAssociatedOpenId, tabAssociationMaintainer);
        queryBus.register(GetRecentlyUnfollowedTabByFollowId, recentlyUnfollowedTabRetriever.queryByFollowId, recentlyUnfollowedTabRetriever);
        queryBus.register(GetRecentlyUnfollowedTabs, recentlyUnfollowedTabRetriever.queryAll, recentlyUnfollowedTabRetriever);
        queryBus.register(GetSessionIdAssociatedToOpenLongLivedId, nativeRecentlyClosedTabAssociationMaintainer.querySessionIdAssociatedToOpenLongLivedId, nativeRecentlyClosedTabAssociationMaintainer);
        queryBus.register(GetTabAssociationsWithFollowState, tabAssociationRetriever.queryFollowedTabs, tabAssociationRetriever);
        queryBus.register(GetTabAssociationsWithOpenState, tabAssociationRetriever.queryOpenedTabs, tabAssociationRetriever);
        queryBus.register(GetTabAssociationByFollowId, tabAssociationRetriever.queryByFollowId, tabAssociationRetriever);
        queryBus.register(GetTabAssociationByOpenId, tabAssociationRetriever.queryByOpenId, tabAssociationRetriever);
        queryBus.register(GetTabFollowStateByFollowId, followedTabRetriever.queryById, followedTabRetriever);
        queryBus.register(GetTabFollowStateWeightList, followedTabRetriever.queryWeightList, followedTabRetriever);
        queryBus.register(GetTabFollowStates, followedTabRetriever.queryAll, followedTabRetriever);
        queryBus.register(GetTabFollowStatesWithOpenLongLivedId, followedTabRetriever.queryAllWithOpenLongLivedId, followedTabRetriever);
        queryBus.register(GetTabOpenStateByOpenId, openedTabRetriever.queryById, openedTabRetriever);
        queryBus.register(GetTabOpenStateByOpenLongLivedId, openedTabRetriever.queryByLongLivedId, openedTabRetriever);
        queryBus.register(GetTabOpenStates, openedTabRetriever.queryAll, openedTabRetriever);
        queryBus.register(SearchTabFollowStates, followedTabSearcher.searchFollowStates, followedTabSearcher);
    }

    function initEventBus() {
        eventBus.subscribe(FollowedTabMoved, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabClosed, nativeRecentlyClosedTabAssociationMaintainer.onTabClose, nativeRecentlyClosedTabAssociationMaintainer);
        eventBus.subscribe(OpenedTabClosed, openedTabRetriever.onTabClose, openedTabRetriever);
        eventBus.subscribe(OpenedTabClosed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabClosed, tabAssociationMaintainer.onTabClose, tabAssociationMaintainer);
        eventBus.subscribe(OpenedTabCloseHandled, closedTabRetriever.onTabCloseHandled, closedTabRetriever);
        eventBus.subscribe(TabOpened, closedTabRetriever.onTabOpen, closedTabRetriever);
        eventBus.subscribe(TabOpened, followedTabUpdater.onTabOpen, followedTabUpdater);
        eventBus.subscribe(TabOpened, openedTabRetriever.onTabOpen, openedTabRetriever);
        eventBus.subscribe(TabOpened, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabFollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabAssociatedToFollowedTab, browserActionBadge.onAssociateOpenedTabToFollowedTab, browserActionBadge);
        eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabUpdater.onAssociateOpenedTabToFollowedTab, followedTabUpdater);
        eventBus.subscribe(OpenedTabAssociatedToFollowedTab, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabAudibleStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabAudioMuteStateUpdated, followedTabUpdater.onOpenedTabAudioMuteStateUpdate, followedTabUpdater);
        eventBus.subscribe(OpenedTabAudioMuteStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabFaviconUrlUpdated, followedTabUpdater.onOpenedTabFaviconUrlUpdate, followedTabUpdater);
        eventBus.subscribe(OpenedTabFaviconUrlUpdated, closedTabRetriever.onTabFaviconUrlUpdate, closedTabRetriever);
        eventBus.subscribe(OpenedTabFaviconUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabFocused, closedTabRetriever.onTabFocus, closedTabRetriever);
        eventBus.subscribe(OpenedTabFocused, followedTabUpdater.onOpenedTabFocus, followedTabUpdater);
        eventBus.subscribe(OpenedTabFocused, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabMoved, closedTabRetriever.onTabMove, closedTabRetriever);
        eventBus.subscribe(OpenedTabMoved, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabPinStateUpdated, closedTabRetriever.onTabPinStateUpdate, closedTabRetriever);
        eventBus.subscribe(OpenedTabPinStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabReaderModeStateUpdated, followedTabUpdater.onOpenedTabReaderModeStateUpdate, followedTabUpdater);
        eventBus.subscribe(OpenedTabReaderModeStateUpdated, closedTabRetriever.onTabReaderModeStateUpdate, closedTabRetriever);
        eventBus.subscribe(OpenedTabReaderModeStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabTitleUpdated, followedTabUpdater.onOpenedTabTitleUpdate, followedTabUpdater);
        eventBus.subscribe(OpenedTabTitleUpdated, closedTabRetriever.onTabTitleUpdate, closedTabRetriever);
        eventBus.subscribe(OpenedTabTitleUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(OpenedTabUrlUpdated, browserActionBadge.onOpenedTabUrlUpdate, browserActionBadge);
        eventBus.subscribe(OpenedTabUrlUpdated, followedTabUpdater.onOpenedTabUrlUpdate, followedTabUpdater);
        eventBus.subscribe(OpenedTabUrlUpdated, closedTabRetriever.onTabUrlUpdate, closedTabRetriever);
        eventBus.subscribe(OpenedTabUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(RecentlyUnfollowedTabAdded, recentlyUnfollowedTabDeleter.onRecentlyUnfollowedTabAdd, recentlyUnfollowedTabDeleter);
        eventBus.subscribe(RecentlyUnfollowedTabAdded, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(RecentlyUnfollowedTabDeleted, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(TabUnfollowed, browserActionBadge.onTabUnfollow, browserActionBadge);
        eventBus.subscribe(TabUnfollowed, recentlyUnfollowedTabInserter.onTabUnfollow, recentlyUnfollowedTabInserter);
        eventBus.subscribe(TabUnfollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(TabUnfollowed, tabAssociationMaintainer.onTabUnfollow, tabAssociationMaintainer);
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
            commandBus.handle(new GoToControlCenter());
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
