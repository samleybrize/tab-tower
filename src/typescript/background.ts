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
import { CloseTab } from './tab/command/close-tab';
import { FocusTab } from './tab/command/focus-tab';
import { FollowTab } from './tab/command/follow-tab';
import { RestoreFollowedTab } from './tab/command/restore-followed-tab';
import { tabCommands } from './tab/command/tab-commands';
import { UnfollowTab } from './tab/command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from './tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './tab/event/opened-tab-focused';
import { OpenedTabLoadingIsComplete } from './tab/event/opened-tab-loading-is-complete';
import { OpenedTabMoved } from './tab/event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './tab/event/opened-tab-url-updated';
import { TabClosed } from './tab/event/tab-closed';
import { tabEvents } from './tab/event/tab-events';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { TabUnfollowed } from './tab/event/tab-unfollowed';
import { FollowedTabModifier } from './tab/followed-tab-modifier';
import { FollowedTabRetriever } from './tab/followed-tab-retriever';
import { NativeRecentlyClosedTabAssociationMaintainer } from './tab/native-recently-closed-tab/native-recently-closed-tab-association-maintainer';
import { WebStoragePersister as WebStorageNativeRecentlyClosedTabAssociationPersister } from './tab/native-recently-closed-tab/web-storage-persister';
import { NativeTabEventHandler } from './tab/native-tab-event-handler';
import { OpenedTabRetriever } from './tab/opened-tab-retriever';
import { InMemoryTabPersister } from './tab/persister/in-memory-tab-persister';
import { WebStorageTabPersister } from './tab/persister/web-storage-tab-persister';
import { PrivilegedUrlDetector } from './tab/privileged-url-detector';
import { GetFollowedTabs } from './tab/query/get-followed-tabs';
import { GetOpenedTabs } from './tab/query/get-opened-tabs';
import { GetTabByFollowId } from './tab/query/get-tab-by-follow-id';
import { GetTabByOpenId } from './tab/query/get-tab-by-open-id';
import { tabQueries } from './tab/query/tab-queries';
import { TabAssociationMaintainer } from './tab/tab-association-maintainer';
import { TabCloser } from './tab/tab-closer';
import { TabFocuser } from './tab/tab-focuser';
import { TabOpener } from './tab/tab-opener';
import { TabRetriever } from './tab/tab-retriever';
import { ObjectUnserializer } from './utils/object-unserializer';

const uiUrlStartWith = `moz-extension://${location.host}/ui/tab-tower.html`;

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const webStorageTabPersister = new WebStorageTabPersister();
    const inMemoryTabPersister = new InMemoryTabPersister(webStorageTabPersister);
    const privilegedUrlDetector = new PrivilegedUrlDetector();
    const tabAssociationMaintainer = new TabAssociationMaintainer();
    const nativeRecentlyClosedTabAssociationPersister = new WebStorageNativeRecentlyClosedTabAssociationPersister();
    const nativeRecentlyClosedTabAssociationMaintainer = new NativeRecentlyClosedTabAssociationMaintainer(nativeRecentlyClosedTabAssociationPersister);
    const followedTabModifier = new FollowedTabModifier(inMemoryTabPersister, tabAssociationMaintainer, eventBus);
    const followedTabRetriever = new FollowedTabRetriever(inMemoryTabPersister);
    const tabFocuser = new TabFocuser();
    const openedTabRetriever = new OpenedTabRetriever(privilegedUrlDetector, [uiUrlStartWith]);
    const tabOpener = new TabOpener(openedTabRetriever, followedTabRetriever, tabAssociationMaintainer, nativeRecentlyClosedTabAssociationMaintainer, eventBus);
    const tabCloser = new TabCloser();
    const tabRetriever = new TabRetriever(followedTabRetriever, openedTabRetriever, tabAssociationMaintainer, eventBus);

    const objectUnserializer = new ObjectUnserializer();
    objectUnserializer.addSupportedClasses(tabCommands);
    objectUnserializer.addSupportedClasses(tabEvents);
    objectUnserializer.addSupportedClasses(tabQueries);

    const messageSender = new BackgroundMessageSender();
    const sendMessageEventHandler = new SendMessageEventHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
    const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
    let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
    receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);

    const messageReceiver = new ContentMessageReceiver(receivedMessageHandler);
    messageReceiver.listen();

    await openedTabRetriever.init();
    await nativeRecentlyClosedTabAssociationMaintainer.init();

    const nativeEventHandler = new NativeTabEventHandler(eventBus, openedTabRetriever, tabCloser, tabOpener);
    nativeEventHandler.init();

    commandBus.register(CloseTab, tabCloser.closeTab, followedTabModifier);
    commandBus.register(FocusTab, tabFocuser.focusTab, followedTabModifier);
    commandBus.register(FollowTab, followedTabModifier.followTab, followedTabModifier);
    commandBus.register(RestoreFollowedTab, tabOpener.restoreFollowedTab, tabOpener);
    commandBus.register(UnfollowTab, followedTabModifier.unfollowTab, followedTabModifier);

    queryBus.register(GetFollowedTabs, tabRetriever.queryFollowedTabs, tabRetriever);
    queryBus.register(GetOpenedTabs, tabRetriever.queryOpenedTabs, tabRetriever);
    queryBus.register(GetTabByFollowId, tabRetriever.queryByFollowId, tabRetriever);
    queryBus.register(GetTabByOpenId, tabRetriever.queryByOpenId, tabRetriever);

    eventBus.subscribe(TabClosed, nativeRecentlyClosedTabAssociationMaintainer.onTabClose, nativeRecentlyClosedTabAssociationMaintainer);
    eventBus.subscribe(TabClosed, openedTabRetriever.onTabClose, openedTabRetriever);
    eventBus.subscribe(TabClosed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(TabClosed, tabAssociationMaintainer.onTabClose, tabAssociationMaintainer);
    eventBus.subscribe(TabOpened, followedTabModifier.onTabOpen, followedTabModifier);
    eventBus.subscribe(TabOpened, openedTabRetriever.onTabOpen, openedTabRetriever);
    eventBus.subscribe(TabOpened, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(TabFollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabModifier.onAssociateOpenedTabToFollowedTab, followedTabModifier);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, followedTabModifier.onOpenedTabFaviconUrlUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, openedTabRetriever.onTabFaviconUrlUpdate, openedTabRetriever);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabFocused, followedTabModifier.onOpenedTabFocus, followedTabModifier);
    eventBus.subscribe(OpenedTabFocused, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabMoved, openedTabRetriever.onTabMove, openedTabRetriever);
    eventBus.subscribe(OpenedTabMoved, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, followedTabModifier.onOpenedTabReaderModeStateUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, openedTabRetriever.onTabReaderModeStateUpdate, openedTabRetriever);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabTitleUpdated, followedTabModifier.onOpenedTabTitleUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabTitleUpdated, openedTabRetriever.onTabTitleUpdate, openedTabRetriever);
    eventBus.subscribe(OpenedTabTitleUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(OpenedTabUrlUpdated, followedTabModifier.onOpenedTabUrlUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabUrlUpdated, openedTabRetriever.onTabUrlUpdate, openedTabRetriever);
    eventBus.subscribe(OpenedTabUrlUpdated, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(TabUnfollowed, sendMessageEventHandler.onEvent, sendMessageEventHandler);
    eventBus.subscribe(TabUnfollowed, tabAssociationMaintainer.onTabUnfollow, tabAssociationMaintainer);

    await tabRetriever.associateOpenedTabsWithFollowedTabs();

    const uiUrl = `moz-extension://${location.host}/ui/tab-tower.html`;
    browser.browserAction.onClicked.addListener(async () => {
        const uiTabs = await browser.tabs.query({url: uiUrl});

        if (uiTabs.length > 0) {
            browser.tabs.update(uiTabs[0].id, {active: true});

            return;
        }

        browser.tabs.create({
            active: true,
            index: 0,
            url: uiUrl,
        });
    });
}

main();
