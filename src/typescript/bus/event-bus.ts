import { Logger } from '../logger/logger';

interface EventType<T> {
    new(...args: any[]): T;
    eventIdentifier?: number;
}

type EventHandler<T> = (event: T) => Promise<void>;

export class EventBus {
    private handlerList = new Map<number, Array<EventHandler<any>>>();

    constructor(private logger: Logger) {
    }

    subscribe<T>(eventType: EventType<T>, handler: EventHandler<T>, bindToHandler?: object) {
        if (null == eventType.eventIdentifier) {
            eventType.eventIdentifier = this.generateEventIdentifier();
        }

        let eventTypehandler = this.handlerList.get(eventType.eventIdentifier);

        if (null == eventTypehandler) {
            eventTypehandler = [];
            this.handlerList.set(eventType.eventIdentifier, eventTypehandler);
        }

        if (bindToHandler) {
            handler = handler.bind(bindToHandler);
        }

        eventTypehandler.push(handler);
    }

    private generateEventIdentifier() {
        return Math.random();
    }

    // TODO to test
    unsubscribe<T>(eventType: EventType<T>, handlerToRemove: EventHandler<T>) {
        const eventIdentifier = (event.constructor as EventType<T>).eventIdentifier;
        const eventHandlerList = this.handlerList.get(eventIdentifier);

        if (null == eventHandlerList || 0 == eventHandlerList.length) {
            return;
        }

        let eventHandlerIndex: number;

        while (eventHandlerIndex = eventHandlerList.indexOf(handlerToRemove)) {
            eventHandlerList.splice(eventHandlerIndex, 1);
        }
    }

    async publish<T>(event: T) {
        this.logger.debug({message: `Publishing event "${event.constructor.name}"`, context: event});

        const eventIdentifier = (event.constructor as EventType<T>).eventIdentifier;
        const eventHandlerList = this.handlerList.get(eventIdentifier);

        if (null == eventHandlerList) {
            return;
        }

        const promises: Array<Promise<any>> = [];

        for (const eventHandler of eventHandlerList) {
            promises.push(eventHandler(event));
        }

        await Promise.all(promises);
    }
}
