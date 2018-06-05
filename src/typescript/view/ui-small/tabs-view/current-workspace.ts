export class CurrentWorkspace {
    private nameElement: HTMLElement;
    private numberOfTabsElement: HTMLElement;

    constructor(containerElement: HTMLElement) {
        this.nameElement = containerElement.querySelector('.name');
        this.numberOfTabsElement = containerElement.querySelector('.number-of-tabs');
    }
}
