import { CommandBus } from './bus/command-bus';
import { EventBus } from './bus/event-bus';
import { QueryBus } from './bus/query-bus';
import { BidirectionalQueryMessageHandler } from './message/bidirectional-query-message-handler';
import { ContentMessageReceiver } from './message/receiver/content-message-receiver';
import { ReceivedCommandMessageHandler } from './message/receiver/received-command-message-handler';
import { ReceivedEventMessageHandler } from './message/receiver/received-event-message-handler';
import { ReceivedMessageHandler } from './message/receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from './message/receiver/received-query-message-handler';
import { BackgroundMessageSender } from './message/sender/background-message-sender';
import { SendMessageEventHandler } from './message/sender/send-message-event-handler';
import { SendMessageQueryHandler } from './message/sender/send-message-query-handler';
import { AssociateOpenedTabToFollowedTab } from './tab/command/associate-opened-tab-to-followed-tab';
import { CloseTab } from './tab/command/close-tab';
import { DuplicateTab } from './tab/command/duplicate-tab';
import { FocusTab } from './tab/command/focus-tab';
import { FollowTab } from './tab/command/follow-tab';
import { MuteTab } from './tab/command/mute-tab';
import { PinTab } from './tab/command/pin-tab';
import { ReloadTab } from './tab/command/reload-tab';
import { RestoreFollowedTab } from './tab/command/restore-followed-tab';
import { tabCommands } from './tab/command/tab-commands';
import { UnfollowTab } from './tab/command/unfollow-tab';
import { UnmuteTab } from './tab/command/unmute-tab';
import { UnpinTab } from './tab/command/unpin-tab';
import { OpenedTabAssociatedToFollowedTab } from './tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabAudibleStateUpdated } from './tab/event/opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from './tab/event/opened-tab-audio-mute-state-updated';
import { OpenedTabFaviconUrlUpdated } from './tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './tab/event/opened-tab-focused';
import { OpenedTabMoved } from './tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from './tab/event/opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from './tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './tab/event/opened-tab-url-updated';
import { TabCloseHandled } from './tab/event/tab-close-handled';
import { TabClosed } from './tab/event/tab-closed';
import { tabEvents } from './tab/event/tab-events';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { TabUnfollowed } from './tab/event/tab-unfollowed';
import { FollowedTabRetriever } from './tab/followed-tab/followed-tab-retriever';
import { FollowedTabUpdater } from './tab/followed-tab/followed-tab-updater';
import { InMemoryTabPersister } from './tab/followed-tab/persister/in-memory-tab-persister';
import { WebStorageTabPersister } from './tab/followed-tab/persister/web-storage-tab-persister';
import { TabFollower } from './tab/followed-tab/tab-follower';
import { TabUnfollower } from './tab/followed-tab/tab-unfollower';
import { NativeRecentlyClosedTabAssociationMaintainer } from './tab/native-recently-closed-tab/native-recently-closed-tab-association-maintainer';
import { WebStoragePersister as WebStorageNativeRecentlyClosedTabAssociationPersister } from './tab/native-recently-closed-tab/web-storage-persister';
import { NativeTabEventHandler } from './tab/native-tab-event-handler';
import { ClosedTabRetriever } from './tab/opened-tab/closed-tab-retriever';
import { OpenedTabRetriever } from './tab/opened-tab/opened-tab-retriever';
import { PrivilegedUrlDetector } from './tab/privileged-url-detector';
import { GetClosedTabOpenStateByOpenId } from './tab/query/get-closed-tab-open-state-by-open-id';
import { GetFollowIdAssociatedToOpenId } from './tab/query/get-follow-id-associated-to-open-id';
import { GetOpenIdAssociatedToFollowId } from './tab/query/get-open-id-associated-to-follow-id';
import { GetSessionIdAssociatedToOpenLongLivedId } from './tab/query/get-session-id-associated-to-open-long-lived-id';
import { GetTabAssociationByFollowId } from './tab/query/get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from './tab/query/get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from './tab/query/get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from './tab/query/get-tab-associations-with-open-state';
import { GetTabFollowStateByFollowId } from './tab/query/get-tab-follow-state-by-follow-id';
import { GetTabFollowStates } from './tab/query/get-tab-follow-states';
import { GetTabFollowStatesWithOpenLongLivedId } from './tab/query/get-tab-follow-states-with-open-long-lived-id';
import { GetTabOpenStateByOpenId } from './tab/query/get-tab-open-state-by-open-id';
import { GetTabOpenStates } from './tab/query/get-tab-open-states';
import { tabQueries } from './tab/query/tab-queries';
import { TabAssociationMaintainer } from './tab/tab-association/tab-association-maintainer';
import { TabAssociationRetriever } from './tab/tab-association/tab-association-retriever';
import { TabCloser } from './tab/tab-closer';
import { TabDuplicator } from './tab/tab-duplicator';
import { TabFocuser } from './tab/tab-focuser';
import { TabMuter } from './tab/tab-muter';
import { TabOpener } from './tab/tab-opener';
import { TabPinner } from './tab/tab-pinner';
import { TabReloader } from './tab/tab-reloader';
import { TabUnmuter } from './tab/tab-unmuter';
import { TabUnpinner } from './tab/tab-unpinner';
import { ObjectUnserializer } from './utils/object-unserializer';

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const webStorageTabPersister = new WebStorageTabPersister();
    const inMemoryTabPersister = new InMemoryTabPersister(webStorageTabPersister);
    const tabFollower = new TabFollower(inMemoryTabPersister, commandBus, eventBus);
    const tabUnfollower = new TabUnfollower(inMemoryTabPersister, eventBus);
    const followedTabUpdater = new FollowedTabUpdater(inMemoryTabPersister, commandBus, queryBus);
    const followedTabRetriever = new FollowedTabRetriever(inMemoryTabPersister);

    const controlCenterDesktopUrlStartWith = `moz-extension://${location.host}/ui/control-center-desktop.html`;
    const privilegedUrlDetector = new PrivilegedUrlDetector();
    const openedTabRetriever = new OpenedTabRetriever(privilegedUrlDetector, [controlCenterDesktopUrlStartWith]);
    const closedTabRetriever = new ClosedTabRetriever(queryBus);
    const tabOpener = new TabOpener(commandBus, queryBus);

    const nativeRecentlyClosedTabAssociationPersister = new WebStorageNativeRecentlyClosedTabAssociationPersister();
    const nativeRecentlyClosedTabAssociationMaintainer = new NativeRecentlyClosedTabAssociationMaintainer(nativeRecentlyClosedTabAssociationPersister);

    const tabAssociationMaintainer = new TabAssociationMaintainer(eventBus, queryBus);
    const tabAssociationRetriever = new TabAssociationRetriever(queryBus);

    const tabCloser = new TabCloser();
    const tabDuplicator = new TabDuplicator();
    const tabFocuser = new TabFocuser();
    const tabMuter = new TabMuter();
    const tabPinner = new TabPinner();
    const tabReloader = new TabReloader();
    const tabUnmuter = new TabUnmuter();
    const tabUnpinner = new TabUnpinner();
    const nativeEventHandler = new NativeTabEventHandler(eventBus, queryBus, tabCloser, tabOpener);

    const objectUnserializer = new ObjectUnserializer();
    const messageSender = new BackgroundMessageSender();
    const sendMessageEventHandler = new SendMessageEventHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    function initMessaging() {
        objectUnserializer.addSupportedClasses(tabCommands);
        objectUnserializer.addSupportedClasses(tabEvents);
        objectUnserializer.addSupportedClasses(tabQueries);

        const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
        const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
        let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
        receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);
        const messageReceiver = new ContentMessageReceiver(receivedMessageHandler);

        messageReceiver.listen();
    }

    function initCommandBus() {
        commandBus.register(AssociateOpenedTabToFollowedTab, tabAssociationMaintainer.associateOpenedTabToFollowedTab, tabAssociationMaintainer);
        commandBus.register(CloseTab, tabCloser.closeTab, tabCloser);
        commandBus.register(DuplicateTab, tabDuplicator.duplicateTab, tabDuplicator);
        commandBus.register(FocusTab, tabFocuser.focusTab, tabFocuser);
        commandBus.register(FollowTab, tabFollower.followTab, tabFollower);
        commandBus.register(MuteTab, tabMuter.muteTab, tabMuter);
        commandBus.register(PinTab, tabPinner.pinTab, tabPinner);
        commandBus.register(ReloadTab, tabReloader.reloadTab, tabReloader);
        commandBus.register(RestoreFollowedTab, tabOpener.restoreFollowedTab, tabOpener);
        commandBus.register(UnfollowTab, tabUnfollower.unfollowTab, tabUnfollower);
        commandBus.register(UnmuteTab, tabUnmuter.unmuteTab, tabUnmuter);
        commandBus.register(UnpinTab, tabUnpinner.unpinTab, tabUnpinner);
    }

    function initQueryBus() {
        queryBus.register(GetClosedTabOpenStateByOpenId, closedTabRetriever.queryById, closedTabRetriever);
        queryBus.register(GetFollowIdAssociatedToOpenId, tabAssociationMaintainer.queryAssociatedFollowId, tabAssociationMaintainer);
        queryBus.register(GetOpenIdAssociatedToFollowId, tabAssociationMaintainer.queryAssociatedOpenId, tabAssociationMaintainer);
        queryBus.register(GetSessionIdAssociatedToOpenLongLivedId, nativeRecentlyClosedTabAssociationMaintainer.querySessionIdAssociatedToOpenLongLivedId, nativeRecentlyClosedTabAssociationMaintainer);
        queryBus.register(GetTabAssociationsWithFollowState, tabAssociationRetriever.queryFollowedTabs, tabAssociationRetriever);
        queryBus.register(GetTabAssociationsWithOpenState, tabAssociationRetriever.queryOpenedTabs, tabAssociationRetriever);
        queryBus.register(GetTabAssociationByFollowId, tabAssociationRetriever.queryByFollowId, tabAssociationRetriever);
        queryBus.register(GetTabAssociationByOpenId, tabAssociationRetriever.queryByOpenId, tabAssociationRetriever);
        queryBus.register(GetTabFollowStateByFollowId, followedTabRetriever.queryById, followedTabRetriever);
        queryBus.register(GetTabFollowStates, followedTabRetriever.queryAll, followedTabRetriever);
        queryBus.register(GetTabFollowStatesWithOpenLongLivedId, followedTabRetriever.queryAllWithOpenLongLivedId, followedTabRetriever);
        queryBus.register(GetTabOpenStateByOpenId, openedTabRetriever.queryById, openedTabRetriever);
        queryBus.register(GetTabOpenStates, openedTabRetriever.queryAll, openedTabRetriever);
    }

    function initEventBus() {
        eventBus.subscribe(TabClosed, nativeRecentlyClosedTabAssociationMaintainer.onTabClose, nativeRecentlyClosedTabAssociationMaintainer);
        eventBus.subscribe(TabClosed, openedTabRetriever.onTabClose, openedTabRetriever);
        eventBus.subscribe(TabClosed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(TabClosed, tabAssociationMaintainer.onTabClose, tabAssociationMaintainer);
        eventBus.subscribe(TabCloseHandled, closedTabRetriever.onTabCloseHandled, closedTabRetriever);
        eventBus.subscribe(TabOpened, closedTabRetriever.onTabOpen, closedTabRetriever);
        eventBus.subscribe(TabOpened, followedTabUpdater.onTabOpen, followedTabUpdater);
        eventBus.subscribe(TabOpened, openedTabRetriever.onTabOpen, openedTabRetriever);
        eventBus.subscribe(TabOpened, sendMessageEventHandler.onEvent, sendMessageEventHandler);
        eventBus.subscribe(TabFollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
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
        eventBus.subscribe(OpenedTabUrlUpdated, followedTabUpdater.onOpenedTabUrlUpdate, followedTabUpdater);
        eventBus.subscribe(OpenedTabUrlUpdated, closedTabRetriever.onTabUrlUpdate, closedTabRetriever);
        eventBus.subscribe(OpenedTabUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
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
        const controlCenterDesktopUrl = `moz-extension://${location.host}/ui/control-center-desktop.html`;
        browser.browserAction.onClicked.addListener(async () => {
            const uiTabs = await browser.tabs.query({url: controlCenterDesktopUrl});

            if (uiTabs.length > 0) {
                browser.tabs.update(uiTabs[0].id, {active: true});

                return;
            }

            browser.tabs.create({
                active: true,
                index: 0,
                url: controlCenterDesktopUrl,
            });
        });
    }

    initMessaging();
    initCommandBus();
    initQueryBus();
    initEventBus();
    await initTabHandling();
    await initBrowserAction();
}

main();
