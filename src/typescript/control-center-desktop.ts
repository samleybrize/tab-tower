import { DetectedBrowser } from './browser/detected-browser';
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
import { DuplicateTab } from './tab/command/duplicate-tab';
import { FocusTab } from './tab/command/focus-tab';
import { FollowTab } from './tab/command/follow-tab';
import { MoveOpenedTabs } from './tab/command/move-opened-tabs';
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
import { IndicatorManipulator } from './view/component/indicator-manipulator';
import { MoreMenuManipulator } from './view/component/more-menu-manipulator';
import { TabFilterApplier } from './view/component/tab-filter-applier';
import { TabMoveAction } from './view/component/tab-move-action';
import { TabSelectorManipulator } from './view/component/tab-selector-manipulator';
import { TabTitleManipulator } from './view/component/tab-title-manipulator';
import { FollowedTabView } from './view/followed-tab-view';
import { HeaderView } from './view/header-view';
import { OpenedTabView } from './view/opened-tab-view';
import { TabCounter } from './view/tab-counter';
import { TabFilterView } from './view/tab-filter-view';
import { TabView } from './view/tab-view';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const detectedBrowser = new DetectedBrowser();
    const stringMatcher = new StringMatcher();
    const tabCounter = new TabCounter();
    const tabSearchView = new TabFilterView(eventBus, document.querySelector('#headerTabFilter'));

    const openedTabView = (() => {
        const openedTabViewContainer: HTMLElement = document.querySelector('#openedTabList');
        const indicatorManipulator = new IndicatorManipulator();
        const moreMenuManipulator = new MoreMenuManipulator();
        const tabFilterApplier = new TabFilterApplier(stringMatcher, openedTabViewContainer);
        const tabMoveAction = new TabMoveAction(openedTabViewContainer);
        const tabSelectorManipulator = new TabSelectorManipulator(openedTabViewContainer);
        const tabTitleManipulator = new TabTitleManipulator(detectedBrowser, defaultFaviconUrl);

        return new OpenedTabView(
            commandBus,
            queryBus,
            tabCounter,
            new TabView(indicatorManipulator, moreMenuManipulator, tabFilterApplier, tabMoveAction, tabSelectorManipulator, tabTitleManipulator, openedTabViewContainer),
            indicatorManipulator,
            moreMenuManipulator,
            tabFilterApplier,
            tabMoveAction,
            tabSelectorManipulator,
            tabTitleManipulator,
        );
    })();

    const followedTabView = (() => {
        const followedTabViewContainer: HTMLElement = document.querySelector('#followedTabList');
        const indicatorManipulator = new IndicatorManipulator();
        const moreMenuManipulator = new MoreMenuManipulator();
        const tabFilterApplier = new TabFilterApplier(stringMatcher, followedTabViewContainer);
        const tabMoveAction = new TabMoveAction(followedTabViewContainer);
        const tabSelectorManipulator = new TabSelectorManipulator(followedTabViewContainer);
        const tabTitleManipulator = new TabTitleManipulator(detectedBrowser, defaultFaviconUrl);

        return new FollowedTabView(
            commandBus,
            queryBus,
            tabCounter,
            new TabView(indicatorManipulator, moreMenuManipulator, tabFilterApplier, tabMoveAction, tabSelectorManipulator, tabTitleManipulator, followedTabViewContainer),
            indicatorManipulator,
            moreMenuManipulator,
            tabFilterApplier,
            tabMoveAction,
            tabSelectorManipulator,
            tabTitleManipulator,
        );
    })();

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
    commandBus.register(DuplicateTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(FocusTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(FollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(MoveOpenedTabs, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(MuteTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(PinTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(ReloadTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(RestoreFollowedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(UnfollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(UnmuteTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
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
    eventBus.subscribe(OpenedTabAudibleStateUpdated, openedTabView.onOpenTabAudibleStateUpdate, openedTabView);
    eventBus.subscribe(OpenedTabAudibleStateUpdated, followedTabView.onOpenTabAudibleStateUpdate, followedTabView);
    eventBus.subscribe(OpenedTabAudioMuteStateUpdated, openedTabView.onOpenTabAudioMuteStateUpdate, openedTabView);
    eventBus.subscribe(OpenedTabAudioMuteStateUpdated, followedTabView.onOpenTabAudioMuteStateUpdate, followedTabView);
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
