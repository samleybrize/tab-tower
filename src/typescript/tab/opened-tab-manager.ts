import { EventBus } from '../bus/event-bus';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabFaviconUrlUpdated } from './event/open-tab-favicon-url-updated';
import { OpenTabTitleUpdated } from './event/open-tab-title-updated';
import { OpenTabUrlUpdated } from './event/open-tab-url-updated';
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

    async updateTitle(tabOpenState: TabOpenState, newTitle: string) {
        const oldTitle = tabOpenState.title;

        tabOpenState.title = newTitle;
        this.eventBus.publish(new OpenTabTitleUpdated(tabOpenState, oldTitle));
    }

    async updateUrl(tabOpenState: TabOpenState, newUrl: string) {
        const oldUrl = tabOpenState.url;

        tabOpenState.url = newUrl;
        this.eventBus.publish(new OpenTabUrlUpdated(tabOpenState, oldUrl));
    }

    async updateFaviconUrl(tabOpenState: TabOpenState, newFaviconUrl: string) {
        const oldFaviconUrl = tabOpenState.faviconUrl;

        tabOpenState.faviconUrl = newFaviconUrl;
        this.eventBus.publish(new OpenTabFaviconUrlUpdated(tabOpenState, oldFaviconUrl));
    }
}
