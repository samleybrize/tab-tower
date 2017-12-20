import { CommandBus } from './bus/command-bus';
import { EventBus } from './bus/event-bus';
import { FocusTab } from './tab/command/focus-tab';
import { FollowTab } from './tab/command/follow-tab';
import { OpenTab } from './tab/command/open-tab';
import { UnfollowTab } from './tab/command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from './tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './tab/event/opened-tab-favicon-url-updated';
import { OpenedTabMoved } from './tab/event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './tab/event/opened-tab-url-updated';
import { TabClosed } from './tab/event/tab-closed';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { TabUnfollowed } from './tab/event/tab-unfollowed';
import { FollowedTabModifier } from './tab/followed-tab-modifier';
import { FollowedTabRetriever } from './tab/followed-tab-retriever';
import { NativeTabEventHandler } from './tab/native-tab-event-handler';
import { OpenedTabModifier } from './tab/opened-tab-modifier';
import { OpenedTabRetriever } from './tab/opened-tab-retriever';
import { InMemoryTabPersister } from './tab/persister/in-memory-tab-persister';
import { WebStorageTabPersister } from './tab/persister/web-storage-tab-persister';
import { TabAssociationMaintainer } from './tab/tab-association-maintainer';
import { TabCloser } from './tab/tab-closer';
import { TabOpener } from './tab/tab-opener';
import { TabRetriever } from './tab/tab-retriever';
import { FollowedTabView } from './view/followed-tab-view';
import { OpenedTabView } from './view/opened-tab-view';

import { QueryBus } from './bus/query-bus'; // TODO
import { BackgroundMessageReceiver } from './message/receiver/background-message-receiver'; // TODO
import { CommandMessageHandler } from './message/receiver/command-message-handler'; // TODO
import { EventMessageHandler } from './message/receiver/event-message-handler'; // TODO
import { MessageHandler } from './message/receiver/message-handler'; // TODO
import { QueryMessageHandler } from './message/receiver/query-message-handler'; // TODO
import { ObjectUnserializer } from './utils/object-unserializer'; // TODO

const defaultFaviconUrl = '/ui/images/default-favicon.svg';
const currentUrl = location.href;

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();

    const webStorageTabPersister = new WebStorageTabPersister();
    const inMemoryTabPersister = new InMemoryTabPersister(webStorageTabPersister);
    const tabAssociationMaintainer = new TabAssociationMaintainer();
    const followedTabModifier = new FollowedTabModifier(inMemoryTabPersister, tabAssociationMaintainer, eventBus);
    const followedTabRetriever = new FollowedTabRetriever(inMemoryTabPersister);
    const openedTabManager = new OpenedTabModifier();
    const openedTabRetriever = new OpenedTabRetriever([currentUrl]);
    const tabOpener = new TabOpener(openedTabRetriever, followedTabRetriever, tabAssociationMaintainer, eventBus);
    const tabCloser = new TabCloser();
    const tabRetriever = new TabRetriever(followedTabRetriever, openedTabRetriever, tabAssociationMaintainer, eventBus);

    const followedTabView = new FollowedTabView(tabRetriever, commandBus, document.querySelector('#followedTabList'), defaultFaviconUrl);
    const openedTabView = new OpenedTabView(tabRetriever, commandBus, document.querySelector('#openedTabList'), defaultFaviconUrl);

    const nativeEventHandler = new NativeTabEventHandler(eventBus, openedTabRetriever, tabCloser, tabOpener);
    nativeEventHandler.init();

    commandBus.register(FocusTab, openedTabManager.focusTab, followedTabModifier);
    commandBus.register(FollowTab, followedTabModifier.followTab, followedTabModifier);
    commandBus.register(OpenTab, tabOpener.openTab, tabOpener);
    commandBus.register(UnfollowTab, followedTabModifier.unfollowTab, followedTabModifier);

    eventBus.subscribe(TabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(TabClosed, followedTabModifier.onTabClose, followedTabModifier);
    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabClosed, tabAssociationMaintainer.onTabClose, tabAssociationMaintainer);
    eventBus.subscribe(TabOpened, openedTabView.onTabOpen, openedTabView);
    eventBus.subscribe(TabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(TabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabView.onAssociateOpenedTabToFollowedTab, followedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabModifier.onAssociateOpenedTabToFollowedTab, followedTabModifier);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, openedTabView.onAssociateOpenedTabToFollowedTab, openedTabView);
    eventBus.subscribe(OpenedTabMoved, followedTabModifier.onOpenTabMove, followedTabModifier);
    eventBus.subscribe(OpenedTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, followedTabModifier.onOpenTabFaviconUrlUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, followedTabModifier.onOpenTabReaderModeStateUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, followedTabView.onOpenTabReaderModeStateUpdate, followedTabView);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, openedTabView.onOpenTabReaderModeStateUpdate, openedTabView);
    eventBus.subscribe(OpenedTabTitleUpdated, followedTabModifier.onOpenTabTitleUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabTitleUpdated, followedTabView.onOpenTabTitleUpdate, followedTabView);
    eventBus.subscribe(OpenedTabTitleUpdated, openedTabView.onOpenTabTitleUpdate, openedTabView);
    eventBus.subscribe(OpenedTabUrlUpdated, followedTabModifier.onOpenTabUrlUpdate, followedTabModifier);
    eventBus.subscribe(OpenedTabUrlUpdated, followedTabView.onOpenTabUrlUpdate, followedTabView);
    eventBus.subscribe(OpenedTabUrlUpdated, openedTabView.onOpenTabUrlUpdate, openedTabView);
    eventBus.subscribe(TabUnfollowed, followedTabView.onTabUnfollow, followedTabView);
    eventBus.subscribe(TabUnfollowed, openedTabView.onTabUnfollow, openedTabView);
    eventBus.subscribe(TabUnfollowed, tabAssociationMaintainer.onTabUnfollow, tabAssociationMaintainer);

    await tabRetriever.associateOpenedTabsWithFollowedTabs();
    followedTabView.init();
    openedTabView.init();

    // TODO ===
    const queryBus = new QueryBus();
    const objectUnserializer = new ObjectUnserializer();
    objectUnserializer.addSupportedClasses([TabClosed]);

    let messageHandler: MessageHandler = new CommandMessageHandler(commandBus, objectUnserializer);
    messageHandler = new EventMessageHandler(eventBus, objectUnserializer, messageHandler);
    messageHandler = new QueryMessageHandler(queryBus, objectUnserializer, messageHandler);

    const messageReceiver = new BackgroundMessageReceiver(messageHandler);
    messageReceiver.listen();

    setTimeout(() => {
        messageHandler.handleMessage({
            messageType: 'event',
            className: 'TabClosed',
            data: {
                tabId: 4,
            },
        });
    }, 2000);
    // TODO ===
}

main();
