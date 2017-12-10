import { EventBus } from './bus/event-bus';
import { NativeEventConverter } from './tab/event/native-event-converter';
import { TabClosed } from './tab/event/tab-closed';
import { TabCreated } from './tab/event/tab-created';
import { TabMoved } from './tab/event/tab-moved';
import { TabUpdated } from './tab/event/tab-updated';
import { FollowedTabRetriever } from './tab/followed-tab-retriever';
import { OpenedTabRetriever } from './tab/opened-tab-retriever';
import { InMemoryTabPersister } from './tab/persister/in-memory-tab-persister';
import { Tab } from './tab/tab';
import { OpenedTabView } from './view/opened-tab-view';

const defaultFaviconUrl = '/ui/images/default-favicon.svg';

function main() {
    const eventBus = new EventBus();

    const inMemoryTabPersister = new InMemoryTabPersister();
    const followedTabRetriever = new FollowedTabRetriever(inMemoryTabPersister);
    const openedTabRetriever = new OpenedTabRetriever(followedTabRetriever);

    const openedTabView = new OpenedTabView(openedTabRetriever, document.querySelector('#openedTabList'), defaultFaviconUrl);

    const nativeEventConverter = new NativeEventConverter(eventBus);
    nativeEventConverter.init();

    eventBus.subscribe(TabClosed, openedTabView.onTabClose, openedTabView);
    eventBus.subscribe(TabCreated, openedTabView.onTabCreate, openedTabView);
    eventBus.subscribe(TabMoved, openedTabView.onTabMove, openedTabView);
    eventBus.subscribe(TabUpdated, openedTabView.onTabUpdate, openedTabView);

    openedTabView.refresh();
}

main();
