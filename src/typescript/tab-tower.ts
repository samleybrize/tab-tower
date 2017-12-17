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

const defaultFaviconUrl = '/ui/images/default-favicon.svg';
const currentUrl = location.href;

async function main() {
    const commandBus = new CommandBus();
    const eventBus = new EventBus();

    const webStorageTabPersister = new WebStorageTabPersister();
    const inMemoryTabPersister = new InMemoryTabPersister(); // TODO decorator
    const tabAssociationMaintainer = new TabAssociationMaintainer();
    const followedTabModifier = new FollowedTabModifier(webStorageTabPersister, tabAssociationMaintainer, eventBus);
    const followedTabRetriever = new FollowedTabRetriever(webStorageTabPersister);
    const openedTabManager = new OpenedTabModifier();
    const openedTabRetriever = new OpenedTabRetriever([currentUrl]);
    const tabOpener = new TabOpener(openedTabRetriever, followedTabRetriever, tabAssociationMaintainer, eventBus);
    const tabCloser = new TabCloser();
    const tabRetriever = new TabRetriever(followedTabRetriever, openedTabRetriever, tabAssociationMaintainer);

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
    eventBus.subscribe(OpenTabMoved, followedTabModifier.onOpenTabMove, followedTabModifier);
    eventBus.subscribe(OpenTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, followedTabModifier.onOpenTabFaviconUrlUpdate, followedTabModifier);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(OpenTabReaderModeStateUpdated, followedTabModifier.onOpenTabReaderModeStateUpdate, followedTabModifier);
    eventBus.subscribe(OpenTabReaderModeStateUpdated, followedTabView.onOpenTabReaderModeStateUpdate, followedTabView);
    eventBus.subscribe(OpenTabReaderModeStateUpdated, openedTabView.onOpenTabReaderModeStateUpdate, openedTabView);
    eventBus.subscribe(OpenTabTitleUpdated, followedTabModifier.onOpenTabTitleUpdate, followedTabModifier);
    eventBus.subscribe(OpenTabTitleUpdated, followedTabView.onOpenTabTitleUpdate, followedTabView);
    eventBus.subscribe(OpenTabTitleUpdated, openedTabView.onOpenTabTitleUpdate, openedTabView);
    eventBus.subscribe(OpenTabUrlUpdated, followedTabModifier.onOpenTabUrlUpdate, followedTabModifier);
    eventBus.subscribe(OpenTabUrlUpdated, followedTabView.onOpenTabUrlUpdate, followedTabView);
    eventBus.subscribe(OpenTabUrlUpdated, openedTabView.onOpenTabUrlUpdate, openedTabView);
    eventBus.subscribe(TabUnfollowed, followedTabView.onTabUnfollow, followedTabView);
    eventBus.subscribe(TabUnfollowed, openedTabView.onTabUnfollow, openedTabView);
    eventBus.subscribe(TabUnfollowed, tabAssociationMaintainer.onTabUnfollow, tabAssociationMaintainer);

    await tabRetriever.associateOpenedTabsWithFollowedTabs();
    followedTabView.init();
    openedTabView.init();
}

main();
