export class CurrentTabListIndicator {
    private isEnabled = false;
    private numberOfTabs = 0;
    private nameElement: HTMLElement;
    private numberOfTabsElement: HTMLElement;

    constructor(containerElement: HTMLElement, private tabListLabel: string) {
        this.nameElement = containerElement.querySelector('.name');
        this.numberOfTabsElement = containerElement.querySelector('.number-of-tabs');
    }

    enable() {
        this.isEnabled = true;
        this.nameElement.textContent = this.tabListLabel;
        this.setNumberOfTabs(this.numberOfTabs);
    }

    disable() {
        this.isEnabled = false;
    }

    setNumberOfTabs(numberOfTabs: number) {
        this.numberOfTabs = numberOfTabs;

        if (!this.isEnabled) {
            return;
        }

        this.numberOfTabsElement.textContent = '' + numberOfTabs;
    }
}
