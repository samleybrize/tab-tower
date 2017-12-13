import { CommandBus } from './bus/command-bus';
import { EventBus } from './bus/event-bus';
import { FollowTab } from './tab/command/follow-tab';
import { NativeEventHandler } from './tab/event/native-event-handler';
import { OpenTabMoved } from './tab/event/open-tab-moved';
import { OpenTabFaviconUrlUpdated } from './tab/event/open-tab-favicon-url-updated';
import { OpenTabTitleUpdated } from './tab/event/open-tab-title-updated';
import { OpenTabUrlUpdated } from './tab/event/open-tab-url-updated';
import { TabClosed } from './tab/event/tab-closed';
import { TabClosing } from './tab/event/tab-closing';
import { TabFollowed } from './tab/event/tab-followed';
import { TabOpened } from './tab/event/tab-opened';
import { FollowedTabManager } from './tab/followed-tab-manager';
import { FollowedTabRetriever } from './tab/followed-tab-retriever';
import { OpenedTabManager } from './tab/opened-tab-manager';
import { OpenedTabRetriever } from './tab/opened-tab-retriever';
import { InMemoryTabPersister } from './tab/persister/in-memory-tab-persister';
import { Tab } from './tab/tab';
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
    const tabRetriever = new TabRetriever(followedTabRetriever, openedTabRetriever);

    const followedTabView = new FollowedTabView(tabRetriever, document.querySelector('#followedTabList'), defaultFaviconUrl);
    const openedTabView = new OpenedTabView(tabRetriever, commandBus, document.querySelector('#openedTabList'), defaultFaviconUrl);

    const nativeEventHandler = new NativeEventHandler(openedTabManager, openedTabRetriever);
    nativeEventHandler.init();

    commandBus.register(FollowTab, followedTabManager.followTab, followedTabManager);

    eventBus.subscribe(TabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabClosing, openedTabRetriever.onTabClosing, openedTabRetriever);
    eventBus.subscribe(TabOpened, openedTabView.onTabOpen, openedTabView);
    eventBus.subscribe(TabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(TabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(OpenTabMoved, openedTabView.onOpenTabMove, openedTabView);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, followedTabView.onOpenTabFaviconUrlUpdate, followedTabView);
    eventBus.subscribe(OpenTabFaviconUrlUpdated, openedTabView.onOpenTabFaviconUrlUpdate, openedTabView);
    eventBus.subscribe(OpenTabTitleUpdated, followedTabView.onOpenTabTitleUpdate, followedTabView);
    eventBus.subscribe(OpenTabTitleUpdated, openedTabView.onOpenTabTitleUpdate, openedTabView);
    eventBus.subscribe(OpenTabUrlUpdated, followedTabView.onOpenTabUrlUpdate, followedTabView);
    eventBus.subscribe(OpenTabUrlUpdated, openedTabView.onOpenTabUrlUpdate, openedTabView);

    followedTabView.init();
    openedTabView.refresh();
}

main();
