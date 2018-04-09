type Observer = (counter: number) => void;

export class Counter {
    private counter = 0;
    private observerList: Observer[] = [];

    set(counter: number) {
        this.counter = +counter;
        this.notifyCounterChanged();
    }

    get(): number {
        return this.counter;
    }

    increment() {
        this.counter++;
        this.notifyCounterChanged();
    }

    decrement() {
        this.counter--;
        this.notifyCounterChanged();
    }

    observe(observer: Observer) {
        this.observerList.push(observer);
    }

    private notifyCounterChanged() {
        for (const observer of this.observerList) {
            observer(this.counter);
        }
    }
}
