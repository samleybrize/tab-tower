import { CommandBus } from './bus/command-bus';
import { EventBus } from './bus/event-bus';
import { QueryBus } from './bus/query-bus';
import { BidirectionalQueryMessageHandler } from './message/bidirectional-query-message-handler';
import { BackgroundMessageReceiver } from './message/receiver/background-message-receiver';
import { ReceivedCommandMessageHandler } from './message/receiver/received-command-message-handler';
import { ReceivedEventMessageHandler } from './message/receiver/received-event-message-handler';
import { ReceivedMessageHandler } from './message/receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from './message/receiver/received-query-message-handler';
import { ContentMessageSender } from './message/sender/content-message-sender';
import { SendMessageCommandHandler } from './message/sender/send-message-command-handler';
import { SendMessageQueryHandler } from './message/sender/send-message-query-handler';
import { CloseTab } from './tab/command/close-tab';
import { FocusTab } from './tab/command/focus-tab';
import { FollowTab } from './tab/command/follow-tab';
import { OpenTab } from './tab/command/open-tab';
import { tabCommands } from './tab/command/tab-commands';
import { UnfollowTab } from './tab/command/unfollow-tab';
import { OpenedTabAssociatedToFollowedTab } from './tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './tab/event/opened-tab-favicon-url-updated';
import { OpenedTabMoved } from './tab/event/opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './tab/event/opened-tab-url-updated';
import { TabClosed } from './tab/event/tab-closed';
import { tabEvents } from './tab/event/tab-events';
import { TabFilterRequested } from './tab/event/tab-filter-requested';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { TabUnfollowed } from './tab/event/tab-unfollowed';
import { GetFollowedTabs } from './tab/query/get-followed-tabs';
import { GetOpenedTabs } from './tab/query/get-opened-tabs';
import { GetTabByFollowId } from './tab/query/get-tab-by-follow-id';
import { GetTabByOpenId } from './tab/query/get-tab-by-open-id';
import { tabQueries } from './tab/query/tab-queries';
import { ObjectUnserializer } from './utils/object-unserializer';
import { StringMatcher } from './utils/string-matcher';
import { FollowedTabView } from './view/followed-tab-view';
import { HeaderView } from './view/header-view';
import { OpenedTabView } from './view/opened-tab-view';
import { TabFilterView } from './view/tab-filter-view';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const stringMatcher = new StringMatcher();
    const followedTabView = new FollowedTabView(commandBus, queryBus, stringMatcher, document.querySelector('#followedTabList'), defaultFaviconUrl);
    const openedTabView = new OpenedTabView(commandBus, queryBus, stringMatcher, document.querySelector('#openedTabList'), defaultFaviconUrl);
    const tabSearchView = new TabFilterView(eventBus, document.querySelector('#tabFilter'));
    const headerView = new HeaderView(followedTabView, openedTabView, document.querySelector('#header'));

    const objectUnserializer = new ObjectUnserializer();
    objectUnserializer.addSupportedClasses(tabCommands);
    objectUnserializer.addSupportedClasses(tabEvents);
    objectUnserializer.addSupportedClasses(tabQueries);

    const messageSender = new ContentMessageSender();
    const sendMessageCommandHandler = new SendMessageCommandHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
    const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
    let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
    receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);

    const messageReceiver = new BackgroundMessageReceiver(receivedMessageHandler);
    messageReceiver.listen();

    commandBus.register(CloseTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(FocusTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(FollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(OpenTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(UnfollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);

    queryBus.register(GetFollowedTabs, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetOpenedTabs, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetTabByFollowId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetTabByOpenId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

    eventBus.subscribe(TabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabOpened, openedTabView.onTabOpen, openedTabView);
    eventBus.subscribe(TabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(TabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabView.onAssociateOpenedTabToFollowedTab, followedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, openedTabView.onAssociateOpenedTabToFollowedTab, openedTabView);
    eventBus.subscribe(OpenedTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, followedTabView.onOpenTabReaderModeStateUpdate, followedTabView);
    eventBus.subscribe(OpenedTabReaderModeStateUpdated, openedTabView.onOpenTabReaderModeStateUpdate, openedTabView);
    eventBus.subscribe(OpenedTabTitleUpdated, followedTabView.onOpenTabTitleUpdate, followedTabView);
    eventBus.subscribe(OpenedTabTitleUpdated, openedTabView.onOpenTabTitleUpdate, openedTabView);
    eventBus.subscribe(OpenedTabUrlUpdated, followedTabView.onOpenTabUrlUpdate, followedTabView);
    eventBus.subscribe(OpenedTabUrlUpdated, openedTabView.onOpenTabUrlUpdate, openedTabView);
    eventBus.subscribe(TabFilterRequested, followedTabView.onTabFilterRequest, followedTabView);
    eventBus.subscribe(TabFilterRequested, openedTabView.onTabFilterRequest, openedTabView);
    eventBus.subscribe(TabUnfollowed, followedTabView.onTabUnfollow, followedTabView);
    eventBus.subscribe(TabUnfollowed, openedTabView.onTabUnfollow, openedTabView);

    headerView.init();
    followedTabView.init();
    openedTabView.init();
    tabSearchView.init();
}

main();
