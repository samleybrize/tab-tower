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
import { PinTab } from './tab/command/pin-tab';
import { ReloadTab } from './tab/command/reload-tab';
import { RestoreFollowedTab } from './tab/command/restore-followed-tab';
import { tabCommands } from './tab/command/tab-commands';
import { UnfollowTab } from './tab/command/unfollow-tab';
import { UnpinTab } from './tab/command/unpin-tab';
import { OpenedTabAssociatedToFollowedTab } from './tab/event/opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './tab/event/opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './tab/event/opened-tab-focused';
import { OpenedTabMoved } from './tab/event/opened-tab-moved';
import { OpenedTabPinStateUpdated } from './tab/event/opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from './tab/event/opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './tab/event/opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './tab/event/opened-tab-url-updated';
import { TabClosed } from './tab/event/tab-closed';
import { tabEvents } from './tab/event/tab-events';
import { TabFilterRequested } from './tab/event/tab-filter-requested';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { TabUnfollowed } from './tab/event/tab-unfollowed';
import { GetTabAssociationByFollowId } from './tab/query/get-tab-association-by-follow-id';
import { GetTabAssociationByOpenId } from './tab/query/get-tab-association-by-open-id';
import { GetTabAssociationsWithFollowState } from './tab/query/get-tab-associations-with-follow-state';
import { GetTabAssociationsWithOpenState } from './tab/query/get-tab-associations-with-open-state';
import { tabQueries } from './tab/query/tab-queries';
import { ObjectUnserializer } from './utils/object-unserializer';
import { StringMatcher } from './utils/string-matcher';
import { FollowedTabView } from './view/followed-tab-view';
import { HeaderView } from './view/header-view';
import { OpenedTabView } from './view/opened-tab-view';
import { TabCounter } from './view/tab-counter';
import { TabFilterView } from './view/tab-filter-view';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const stringMatcher = new StringMatcher();
    const tabCounter = new TabCounter();
    const followedTabView = new FollowedTabView(commandBus, queryBus, stringMatcher, tabCounter, document.querySelector('#followedTabList'), defaultFaviconUrl);
    const openedTabView = new OpenedTabView(commandBus, queryBus, stringMatcher, tabCounter, document.querySelector('#openedTabList'), defaultFaviconUrl);
    const tabSearchView = new TabFilterView(eventBus, document.querySelector('#headerTabFilter'));
    const headerView = new HeaderView(followedTabView, openedTabView, document.querySelector('#header'));

    tabCounter.observeNumberOfFollowedTabs(headerView.notifyNumberOfFollowedTabsChanged.bind(headerView));
    tabCounter.observeNumberOfOpenedTabs(headerView.notifyNumberOfOpenedTabsChanged.bind(headerView));

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
    commandBus.register(PinTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(ReloadTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(RestoreFollowedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(UnfollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(UnpinTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);

    queryBus.register(GetTabAssociationsWithFollowState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetTabAssociationsWithOpenState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetTabAssociationByFollowId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(GetTabAssociationByOpenId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

    eventBus.subscribe(TabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabOpened, openedTabView.onTabOpen, openedTabView);
    eventBus.subscribe(TabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(TabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(OpenedTabFocused, openedTabView.onTabFocus, openedTabView);
    eventBus.subscribe(OpenedTabFocused, followedTabView.onTabFocus, followedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabView.onAssociateOpenedTabToFollowedTab, followedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, openedTabView.onAssociateOpenedTabToFollowedTab, openedTabView);
    eventBus.subscribe(OpenedTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(OpenedTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(OpenedTabPinStateUpdated, followedTabView.onOpenTabPinStateUpdate, followedTabView);
    eventBus.subscribe(OpenedTabPinStateUpdated, openedTabView.onOpenTabPinStateUpdate, openedTabView);
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
