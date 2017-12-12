import { EventBus } from '../../bus/event-bus';
import { OpenTabMoved } from './open-tab-moved';
import { OpenTabUpdated } from './open-tab-updated';
import { TabClosed } from './tab-closed';
import { TabClosing } from './tab-closing';
import { TabOpened } from './tab-opened';

export class NativeEventConverter {
    private isInited = false;

    constructor(private eventBus: EventBus) {
    }

    init() {
        if (this.isInited) {
            return;
        }

        this.isInited = true;
        browser.tabs.onCreated.addListener(this.onTabCreate.bind(this));
        browser.tabs.onRemoved.addListener(this.onTabClose.bind(this));
        browser.tabs.onMoved.addListener(this.onOpenTabMove.bind(this));
        browser.tabs.onUpdated.addListener(this.onOpenTabUpdate.bind(this));
    }

    onTabCreate(nativeTab: browser.tabs.Tab) {
        // TODO retrieve tab
        this.eventBus.publish(new TabOpened());
    }

    async onTabClose(tabId: number, removeInfo: any) {
        await this.eventBus.publish(new TabClosed(tabId));
        this.eventBus.publish(new TabClosing(tabId));
    }

    onOpenTabMove(tabId: number, moveInfo: any) {
        // TODO retrieve tab
        this.eventBus.publish(new OpenTabMoved());
    }

    onOpenTabUpdate(tabId: number, updateInfo: any) {
        // TODO retrieve tab
        this.eventBus.publish(new OpenTabUpdated());
    }
}
