import { EventBus } from '../bus/event-bus';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabUpdated } from './event/open-tab-updated';
import { TabClosed } from './event/tab-closed';
import { TabClosing } from './event/tab-closing';
import { TabOpened } from './event/tab-opened';
import { TabOpenState } from './tab-open-state';

// TODO rename
export class OpenedTabManager {
    constructor(private eventBus: EventBus) {
    }

    async open(tabOpenState: TabOpenState) {
        this.eventBus.publish(new TabOpened(tabOpenState));
    }

    async close(tabId: number) {
        await this.eventBus.publish(new TabClosing(tabId));
        this.eventBus.publish(new TabClosed(tabId));
    }

    async move(tabOpenState: TabOpenState, newIndex: number) {
        const oldIndex = tabOpenState.index;
        tabOpenState.index = newIndex;
        this.eventBus.publish(new OpenTabMoved(tabOpenState, oldIndex));
    }

    async update(
        tabOpenState: TabOpenState,
        newTitle: string,
        newUrl: string,
        newFavIconUrl: string,
    ) {
        const oldTitle = tabOpenState.title;
        const oldUrl = tabOpenState.url;
        const oldFaviconUrl = tabOpenState.faviconUrl;

        tabOpenState.title = newTitle;
        tabOpenState.url = newUrl;
        tabOpenState.faviconUrl = newFavIconUrl;
        this.eventBus.publish(new OpenTabUpdated(
            tabOpenState,
            oldTitle,
            oldUrl,
            oldFaviconUrl,
        ));
    }
}
