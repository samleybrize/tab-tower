import { GetBackgroundState } from '../background/get-background-state';
import { DetectedBrowser } from '../browser/detected-browser';
import { CommandBus } from '../bus/command-bus';
import { EventBus } from '../bus/event-bus';
import { QueryBus } from '../bus/query-bus';
import { BidirectionalQueryMessageHandler } from '../message/bidirectional-query-message-handler';
import { BackgroundMessageReceiver } from '../message/receiver/background-message-receiver';
import { ReceivedCommandMessageHandler } from '../message/receiver/received-command-message-handler';
import { ReceivedEventMessageHandler } from '../message/receiver/received-event-message-handler';
import { ReceivedMessageHandler } from '../message/receiver/received-message-handler';
import { ReceivedQueryMessageHandler } from '../message/receiver/received-query-message-handler';
import { ContentMessageSender } from '../message/sender/content-message-sender';
import { SendMessageCommandHandler } from '../message/sender/send-message-command-handler';
import { SendMessageQueryHandler } from '../message/sender/send-message-query-handler';
import * as tabCommands from '../tab/command';
import * as tabEvents from '../tab/event';
import * as tabQueries from '../tab/query';
import { TabMatcher } from '../tab/tab-matcher';
import { Counter } from '../utils/counter';
import { ObjectUnserializer } from '../utils/object-unserializer';
import { sleep } from '../utils/sleep';
import { StringMatcher } from '../utils/string-matcher';
import { IndicatorManipulator } from '../view/component/indicator-manipulator';
import { MoreMenuManipulator } from '../view/component/more-menu-manipulator';
import { TabFilterApplier } from '../view/component/tab-filter-applier';
import { TabMoveAction } from '../view/component/tab-move-action';
import { TabSelectorManipulator } from '../view/component/tab-selector-manipulator';
import { TabTitleManipulator } from '../view/component/tab-title-manipulator';
import { FollowedTabView } from '../view/followed-tab-view';
import { HeaderView } from '../view/header-view';
import { OpenedTabView } from '../view/opened-tab-view';
import { TabFilterView } from '../view/tab-filter-view';
import { TabView } from '../view/tab-view';
import { RecentlyUnfollowedTabView } from './recently-unfollowed-tab-view';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();
    const queryBus = new QueryBus();

    const detectedBrowser = new DetectedBrowser();
    const stringMatcher = new StringMatcher();
    const tabMatcher = new TabMatcher(stringMatcher);
    const tabFilterView = new TabFilterView(eventBus, tabMatcher, document.querySelector('#headerTabFilter'));

    const openedTabCounter = new Counter();
    const followedTabCounter = new Counter();
    const recentlyUnfollowedTabCounter = new Counter();

    const openedTabView = (() => {
        const openedTabViewContainer: HTMLElement = document.querySelector('#openedTabList');
        const indicatorManipulator = new IndicatorManipulator();
        const moreMenuManipulator = new MoreMenuManipulator();
        const tabFilterApplier = new TabFilterApplier(stringMatcher, openedTabViewContainer);
        const tabMoveAction = new TabMoveAction(openedTabViewContainer);
        const tabSelectorManipulator = new TabSelectorManipulator(openedTabViewContainer);
        const tabTitleManipulator = new TabTitleManipulator(detectedBrowser, tabMatcher, defaultFaviconUrl);

        return new OpenedTabView(
            commandBus,
            queryBus,
            new TabView(openedTabCounter, indicatorManipulator, moreMenuManipulator, tabFilterApplier, tabMoveAction, tabSelectorManipulator, tabTitleManipulator, openedTabViewContainer),
            indicatorManipulator,
            moreMenuManipulator,
            tabFilterApplier,
            tabMoveAction,
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
        const tabTitleManipulator = new TabTitleManipulator(detectedBrowser, tabMatcher, defaultFaviconUrl);

        return new FollowedTabView(
            commandBus,
            queryBus,
            new TabView(followedTabCounter, indicatorManipulator, moreMenuManipulator, tabFilterApplier, tabMoveAction, tabSelectorManipulator, tabTitleManipulator, followedTabViewContainer),
            indicatorManipulator,
            moreMenuManipulator,
            tabFilterApplier,
            tabMoveAction,
            tabTitleManipulator,
        );
    })();

    const recentlyUnfollowedTabView = (() => {
        const recentlyUnfollowedTabViewContainer: HTMLElement = document.querySelector('#recentlyUnfollowedTabList');
        const indicatorManipulator = new IndicatorManipulator();
        const moreMenuManipulator = new MoreMenuManipulator();
        const tabFilterApplier = new TabFilterApplier(stringMatcher, recentlyUnfollowedTabViewContainer);
        const tabMoveAction = new TabMoveAction(recentlyUnfollowedTabViewContainer);
        const tabSelectorManipulator = new TabSelectorManipulator(recentlyUnfollowedTabViewContainer);
        const tabTitleManipulator = new TabTitleManipulator(detectedBrowser, tabMatcher, defaultFaviconUrl);

        return new RecentlyUnfollowedTabView(
            commandBus,
            queryBus,
            new TabView(recentlyUnfollowedTabCounter, indicatorManipulator, moreMenuManipulator, tabFilterApplier, tabMoveAction, tabSelectorManipulator, tabTitleManipulator, recentlyUnfollowedTabViewContainer),
            moreMenuManipulator,
            tabFilterApplier,
        );
    })();

    const headerView = new HeaderView(followedTabView, openedTabView, recentlyUnfollowedTabView, document.querySelector('#header'));

    openedTabCounter.observe(headerView.notifyNumberOfOpenedTabsChanged.bind(headerView));
    followedTabCounter.observe(headerView.notifyNumberOfFollowedTabsChanged.bind(headerView));
    recentlyUnfollowedTabCounter.observe(headerView.notifyNumberOfRecentlyUnfollowedTabsChanged.bind(headerView));

    const objectUnserializer = new ObjectUnserializer();
    objectUnserializer.addSupportedClassesFromImportObject(tabCommands);
    objectUnserializer.addSupportedClassesFromImportObject(tabEvents);
    objectUnserializer.addSupportedClassesFromImportObject(tabQueries);

    const messageSender = new ContentMessageSender();
    const sendMessageCommandHandler = new SendMessageCommandHandler(messageSender);
    const sendMessageQueryHandler = new SendMessageQueryHandler(messageSender);

    const receivedQueryMessageHandler = new ReceivedQueryMessageHandler(queryBus, objectUnserializer);
    const bidirectionalQueryMessageHandler = new BidirectionalQueryMessageHandler(receivedQueryMessageHandler, sendMessageQueryHandler);
    let receivedMessageHandler: ReceivedMessageHandler = new ReceivedCommandMessageHandler(commandBus, objectUnserializer, bidirectionalQueryMessageHandler);
    receivedMessageHandler = new ReceivedEventMessageHandler(eventBus, objectUnserializer, receivedMessageHandler);

    const messageReceiver = new BackgroundMessageReceiver(receivedMessageHandler);
    messageReceiver.listen();

    commandBus.register(tabCommands.CloseOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.DeleteRecentlyUnfollowedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.DuplicateOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.FocusOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.FollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.MoveFollowedTabs, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.MoveOpenedTabs, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.MuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.PinOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.ReloadOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.RestoreFollowedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.RestoreRecentlyUnfollowedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.UnfollowTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.UnmuteOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);
    commandBus.register(tabCommands.UnpinOpenedTab, sendMessageCommandHandler.onCommand, sendMessageCommandHandler);

    queryBus.register(GetBackgroundState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(tabQueries.GetRecentlyUnfollowedTabs, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(tabQueries.GetTabAssociationsWithFollowState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(tabQueries.GetTabAssociationsWithOpenState, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(tabQueries.GetTabAssociationByFollowId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);
    queryBus.register(tabQueries.GetTabAssociationByOpenId, bidirectionalQueryMessageHandler.onQuery, bidirectionalQueryMessageHandler);

    eventBus.subscribe(tabEvents.FollowedTabMoved, followedTabView.onFollowedTabMove, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(tabEvents.TabOpened, openedTabView.onTabOpen, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabAudibleStateUpdated, openedTabView.onOpenTabAudibleStateUpdate, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabAudibleStateUpdated, followedTabView.onOpenTabAudibleStateUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabAudioMuteStateUpdated, openedTabView.onOpenTabAudioMuteStateUpdate, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabAudioMuteStateUpdated, followedTabView.onOpenTabAudioMuteStateUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabFocused, openedTabView.onTabFocus, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabFocused, followedTabView.onTabFocus, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabAssociatedToFollowedTab, followedTabView.onAssociateOpenedTabToFollowedTab, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabAssociatedToFollowedTab, openedTabView.onAssociateOpenedTabToFollowedTab, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabPinStateUpdated, followedTabView.onOpenTabPinStateUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabPinStateUpdated, openedTabView.onOpenTabPinStateUpdate, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabReaderModeStateUpdated, followedTabView.onOpenTabReaderModeStateUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabReaderModeStateUpdated, openedTabView.onOpenTabReaderModeStateUpdate, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabTitleUpdated, followedTabView.onOpenTabTitleUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabTitleUpdated, openedTabView.onOpenTabTitleUpdate, openedTabView);
    eventBus.subscribe(tabEvents.OpenedTabUrlUpdated, followedTabView.onOpenTabUrlUpdate, followedTabView);
    eventBus.subscribe(tabEvents.OpenedTabUrlUpdated, openedTabView.onOpenTabUrlUpdate, openedTabView);
    eventBus.subscribe(tabEvents.RecentlyUnfollowedTabAdded, recentlyUnfollowedTabView.onRecentlyUnfollowedTabAdd, recentlyUnfollowedTabView);
    eventBus.subscribe(tabEvents.RecentlyUnfollowedTabDeleted, recentlyUnfollowedTabView.onRecentlyUnfollowedTabDelete, recentlyUnfollowedTabView);
    eventBus.subscribe(tabEvents.TabFilterRequested, followedTabView.onTabFilterRequest, followedTabView);
    eventBus.subscribe(tabEvents.TabFilterRequested, openedTabView.onTabFilterRequest, openedTabView);
    eventBus.subscribe(tabEvents.TabFilterRequested, recentlyUnfollowedTabView.onTabFilterRequest, recentlyUnfollowedTabView);
    eventBus.subscribe(tabEvents.TabUnfollowed, followedTabView.onTabUnfollow, followedTabView);
    eventBus.subscribe(tabEvents.TabUnfollowed, openedTabView.onTabUnfollow, openedTabView);

    async function initViews() {
        await waitBackgroundReady();

        headerView.init();
        tabFilterView.init();

        await Promise.all([
            recentlyUnfollowedTabView.init(),
            followedTabView.init(),
            openedTabView.init(),
        ]);

        document.querySelector('#loading').classList.add('transparent');
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

    await initViews();
}

main();
