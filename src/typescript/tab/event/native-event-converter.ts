import { EventBus } from '../../bus/event-bus';
import { TabClosed } from './tab-closed';
import { TabCreated } from './tab-created';
import { TabMoved } from './tab-moved';
import { TabUpdated } from './tab-updated';

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
        browser.tabs.onMoved.addListener(this.onTabMove.bind(this));
        browser.tabs.onUpdated.addListener(this.onTabUpdate.bind(this));
    }

    onTabCreate(nativeTab: browser.tabs.Tab) {
        this.eventBus.publish(new TabCreated());
    }

    onTabClose(tabId: number, removeInfo: any) {
        this.eventBus.publish(new TabClosed(tabId));
    }

    onTabMove(tabId: number, moveInfo: any) {
        this.eventBus.publish(new TabMoved());
    }

    onTabUpdate(tabId: number, updateInfo: any) {
        this.eventBus.publish(new TabUpdated());
    }
}
