// TODO rename
export class CurrentTabListIndicator {
    private isEnabled = false;
    private numberOfTabs = 0;
    private nameElement: HTMLElement;
    private numberOfTabsElement: HTMLElement;

    constructor(containerElement: HTMLElement, private label: string) {
        this.nameElement = containerElement.querySelector('.name');
        this.numberOfTabsElement = containerElement.querySelector('.number-of-tabs');
    }

    enable() {
        this.isEnabled = true;
        this.setLabel(this.label);
        this.setNumberOfTabs(this.numberOfTabs);
    }

    disable() {
        this.isEnabled = false;
    }

    setNumberOfTabs(numberOfTabs: number) {
        this.numberOfTabs = numberOfTabs;

        if (this.isEnabled) {
            this.numberOfTabsElement.textContent = '' + numberOfTabs;
        }
    }

    incrementNumberOfTabs() {
        this.setNumberOfTabs(this.numberOfTabs + 1);
    }

    decrementNumberOfTabs() {
        this.setNumberOfTabs(
            Math.max(0, this.numberOfTabs - 1),
        );
    }

    setLabel(newLabel: string) {
        this.label = newLabel;

        if (this.isEnabled) {
            this.nameElement.textContent = newLabel;
        }
    }
}
