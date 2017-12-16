import { CommandBus } from './bus/command-bus';
import { EventBus } from './bus/event-bus';
import { FocusTab } from './tab/command/focus-tab';
import { FollowTab } from './tab/command/follow-tab';
import { OpenTab } from './tab/command/open-tab';
import { UnfollowTab } from './tab/command/unfollow-tab';
import { OpenTabFaviconUrlUpdated } from './tab/event/open-tab-favicon-url-updated';
import { OpenTabMoved } from './tab/event/open-tab-moved';
import { OpenTabReaderModeStateUpdated } from './tab/event/open-tab-reader-mode-state-updated';
import { OpenTabTitleUpdated } from './tab/event/open-tab-title-updated';
import { OpenTabUrlUpdated } from './tab/event/open-tab-url-updated';
import { OpenedTabAssociatedToFollowedTab } from './tab/event/opened-tab-associated-to-followed-tab';
import { TabClosed } from './tab/event/tab-closed';
import { TabClosing } from './tab/event/tab-closing';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { TabUnfollowed } from './tab/event/tab-unfollowed';
import { FollowedTabManager } from './tab/followed-tab-manager';
import { FollowedTabRetriever } from './tab/followed-tab-retriever';
import { NativeTabEventHandler } from './tab/native-tab-event-handler';
import { OpenedTabManager } from './tab/opened-tab-manager';
import { OpenedTabRetriever } from './tab/opened-tab-retriever';
import { InMemoryTabPersister } from './tab/persister/in-memory-tab-persister';
import { Tab } from './tab/tab';
import { TabOpener } from './tab/tab-opener';
import { TabRetriever } from './tab/tab-retriever';
import { FollowedTabView } from './view/followed-tab-view';
import { OpenedTabView } from './view/opened-tab-view';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';
const currentUrl = location.href;

function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();

    const inMemoryTabPersister = new InMemoryTabPersister();
    const followedTabManager = new FollowedTabManager(inMemoryTabPersister, eventBus);
    const followedTabRetriever = new FollowedTabRetriever(inMemoryTabPersister);
    const openedTabManager = new OpenedTabManager(eventBus);
    const openedTabRetriever = new OpenedTabRetriever([currentUrl]);
    const tabOpener = new TabOpener(openedTabRetriever, followedTabManager, followedTabRetriever);
    const tabRetriever = new TabRetriever(followedTabRetriever, openedTabRetriever);

    const followedTabView = new FollowedTabView(tabRetriever, commandBus, document.querySelector('#followedTabList'), defaultFaviconUrl);
    const openedTabView = new OpenedTabView(tabRetriever, commandBus, document.querySelector('#openedTabList'), defaultFaviconUrl);

    const nativeEventHandler = new NativeTabEventHandler(openedTabManager, openedTabRetriever, tabOpener);
    nativeEventHandler.init();

    commandBus.register(FocusTab, openedTabManager.focusTab, followedTabManager);
    commandBus.register(FollowTab, followedTabManager.followTab, followedTabManager);
    commandBus.register(OpenTab, tabOpener.openTab, tabOpener);
    commandBus.register(UnfollowTab, followedTabManager.unfollowTab, followedTabManager);

    eventBus.subscribe(TabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(TabClosed, followedTabManager.onTabClose, followedTabManager);
    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabClosing, openedTabRetriever.onTabClosing, openedTabRetriever);
    eventBus.subscribe(TabOpened, openedTabView.onTabOpen, openedTabView);
    eventBus.subscribe(TabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(TabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, followedTabView.onAssociateOpenedTabToFollowedTab, followedTabView);
    eventBus.subscribe(OpenedTabAssociatedToFollowedTab, openedTabView.onAssociateOpenedTabToFollowedTab, openedTabView);
    eventBus.subscribe(OpenTabMoved, followedTabManager.onOpenTabMove, followedTabManager);
    eventBus.subscribe(OpenTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, followedTabManager.onOpenTabFaviconUrlUpdate, followedTabManager);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(OpenTabReaderModeStateUpdated, followedTabManager.onOpenTabReaderModeStateUpdate, followedTabManager);
    eventBus.subscribe(OpenTabReaderModeStateUpdated, followedTabView.onOpenTabReaderModeStateUpdate, followedTabView);
    eventBus.subscribe(OpenTabReaderModeStateUpdated, openedTabView.onOpenTabReaderModeStateUpdate, openedTabView);
    eventBus.subscribe(OpenTabTitleUpdated, followedTabManager.onOpenTabTitleUpdate, followedTabManager);
    eventBus.subscribe(OpenTabTitleUpdated, followedTabView.onOpenTabTitleUpdate, followedTabView);
    eventBus.subscribe(OpenTabTitleUpdated, openedTabView.onOpenTabTitleUpdate, openedTabView);
    eventBus.subscribe(OpenTabUrlUpdated, followedTabManager.onOpenTabUrlUpdate, followedTabManager);
    eventBus.subscribe(OpenTabUrlUpdated, followedTabView.onOpenTabUrlUpdate, followedTabView);
    eventBus.subscribe(OpenTabUrlUpdated, openedTabView.onOpenTabUrlUpdate, openedTabView);
    eventBus.subscribe(TabUnfollowed, followedTabView.onTabUnfollow, followedTabView);
    eventBus.subscribe(TabUnfollowed, openedTabView.onTabUnfollow, openedTabView);

    followedTabView.init();
    openedTabView.init();
}

main();
