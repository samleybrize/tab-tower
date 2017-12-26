type Observer = (counter: number) => void;

export class TabCounter {
    private numberOfOpenedTabs = 0;
    private numberOfFollowedTabs = 0;
    private numberOfOpenedTabsObservers: Observer[] = [];
    private numberOfFollowedTabsObservers: Observer[] = [];

    setNumberOfOpenedTabs(counter: number) {
        this.numberOfOpenedTabs = +counter;
        this.notifyNumberOfOpenedTabsChanged();
    }

    incrementNumberOfOpenedTabs() {
        this.numberOfOpenedTabs++;
        this.notifyNumberOfOpenedTabsChanged();
    }

    decrementNumberOfOpenedTabs() {
        this.numberOfOpenedTabs--;
        this.notifyNumberOfOpenedTabsChanged();
    }

    observeNumberOfOpenedTabs(observer: Observer) {
        this.numberOfOpenedTabsObservers.push(observer);
    }

    private notifyNumberOfOpenedTabsChanged() {
        for (const observer of this.numberOfOpenedTabsObservers) {
            observer(this.numberOfOpenedTabs);
        }
    }

    setNumberOfFollowedTabs(counter: number) {
        this.numberOfFollowedTabs = +counter;
        this.notifyNumberOfFollowedTabsChanged();
    }

    incrementNumberOfFollowedTabs() {
        this.numberOfFollowedTabs++;
        this.notifyNumberOfFollowedTabsChanged();
    }

    decrementNumberOfFollowedTabs() {
        this.numberOfFollowedTabs--;
        this.notifyNumberOfFollowedTabsChanged();
    }

    observeNumberOfFollowedTabs(observer: Observer) {
        this.numberOfFollowedTabsObservers.push(observer);
    }

    private notifyNumberOfFollowedTabsChanged() {
        for (const observer of this.numberOfFollowedTabsObservers) {
            observer(this.numberOfFollowedTabs);
        }
    }
}
