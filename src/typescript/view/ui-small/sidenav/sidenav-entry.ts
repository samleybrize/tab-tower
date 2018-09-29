export class SidenavEntry {
    private active: boolean;

    constructor(public readonly htmlElement: HTMLElement) {
    }

    hide() {
        this.htmlElement.classList.add('hide');
    }

    unhide() {
        this.htmlElement.classList.remove('hide');
    }

    markAsActive() {
        this.htmlElement.classList.add('active');
        this.active = true;
    }

    markAsNotActive() {
        this.htmlElement.classList.remove('active');
        this.active = false;
    }

    isActive() {
        return this.active;
    }
}
