import { EventBus } from '../bus/event-bus';
import { FocusTab } from './command/focus-tab';
import { OpenTabFaviconUrlUpdated } from './event/open-tab-favicon-url-updated';
import { OpenTabMoved } from './event/open-tab-moved';
import { OpenTabReaderModeStateUpdated } from './event/open-tab-reader-mode-state-updated';
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

    async focusTab(command: FocusTab) {
        browser.tabs.update(command.tabId, {active: true});
    }

    // TODO move to native tab event handler?
    async nativeTabOpened(tabOpenState: TabOpenState) {
        this.eventBus.publish(new TabOpened(tabOpenState));
    }

    // TODO move to native tab event handler?
    async nativeTabClosed(tabId: number) {
        await this.eventBus.publish(new TabClosing(tabId));
        this.eventBus.publish(new TabClosed(tabId));
    }

    // TODO move to native tab event handler?
    async nativeTabMoved(tabOpenState: TabOpenState, newIndex: number) {
        const oldIndex = tabOpenState.index;
        tabOpenState.index = newIndex;
        this.eventBus.publish(new OpenTabMoved(tabOpenState, oldIndex));
    }

    // TODO move to native tab event handler?
    async nativeTabTitleUpdated(tabOpenState: TabOpenState, newTitle: string) {
        const oldTitle = tabOpenState.title;

        tabOpenState.title = newTitle;
        this.eventBus.publish(new OpenTabTitleUpdated(tabOpenState, oldTitle));
    }

    // TODO move to native tab event handler?
    async nativeTabUrlUpdated(tabOpenState: TabOpenState, newUrl: string) {
        const oldUrl = tabOpenState.url;

        tabOpenState.url = newUrl;
        this.eventBus.publish(new OpenTabUrlUpdated(tabOpenState, oldUrl));
    }

    // TODO move to native tab event handler?
    async nativeTabReaderModeStateUpdated(tabOpenState: TabOpenState, newReaderModeState: boolean) {
        const oldReaderModeState = tabOpenState.isInReaderMode;

        tabOpenState.isInReaderMode = newReaderModeState;
        this.eventBus.publish(new OpenTabReaderModeStateUpdated(tabOpenState, oldReaderModeState));
    }

    // TODO move to native tab event handler?
    async nativeTabFaviconUrlUpdated(tabOpenState: TabOpenState, newFaviconUrl: string) {
        const oldFaviconUrl = tabOpenState.faviconUrl;

        tabOpenState.faviconUrl = newFaviconUrl;
        this.eventBus.publish(new OpenTabFaviconUrlUpdated(tabOpenState, oldFaviconUrl));
    }
}
