import { CommandBus } from './bus/command-bus';
import { EventBus } from './bus/event-bus';
import { FollowTab } from './tab/command/follow-tab';
import { NativeEventConverter } from './tab/event/native-event-converter';
import { TabClosed } from './tab/event/tab-closed';
import { TabClosing } from './tab/event/tab-closing';
import { TabCreated } from './tab/event/tab-created';
import { TabFollowed } from './tab/event/tab-followed';
import { TabMoved } from './tab/event/tab-moved';
import { TabUpdated } from './tab/event/tab-updated';
import { FollowedTabManager } from './tab/followed-tab-manager';
import { FollowedTabRetriever } from './tab/followed-tab-retriever';
import { OpenedTabRetriever } from './tab/opened-tab-retriever';
import { InMemoryTabPersister } from './tab/persister/in-memory-tab-persister';
import { Tab } from './tab/tab';
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
    const openedTabRetriever = new OpenedTabRetriever(followedTabRetriever, [currentUrl]);

    const followedTabView = new FollowedTabView(followedTabRetriever, document.querySelector('#followedTabList'), defaultFaviconUrl);
    const openedTabView = new OpenedTabView(openedTabRetriever, commandBus, document.querySelector('#openedTabList'), defaultFaviconUrl);

    const nativeEventConverter = new NativeEventConverter(eventBus);
    nativeEventConverter.init();

    commandBus.register(FollowTab, followedTabManager.followTab, followedTabManager);

    eventBus.subscribe(TabClosed, followedTabView.onTabClose, followedTabView);
    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabClosing, openedTabRetriever.onTabClosing, openedTabRetriever);
    eventBus.subscribe(TabCreated, openedTabView.onTabCreate, openedTabView);
    eventBus.subscribe(TabFollowed, followedTabView.onTabFollow, followedTabView);
    eventBus.subscribe(TabFollowed, openedTabView.onTabFollow, openedTabView);
    eventBus.subscribe(TabMoved, followedTabView.onTabMove, followedTabView);
    eventBus.subscribe(TabMoved, openedTabView.onTabMove, openedTabView);
    eventBus.subscribe(TabUpdated, followedTabView.onTabUpdate, followedTabView);
    eventBus.subscribe(TabUpdated, openedTabView.onTabUpdate, openedTabView);

    followedTabView.refresh();
    openedTabView.refresh();
}

main();
