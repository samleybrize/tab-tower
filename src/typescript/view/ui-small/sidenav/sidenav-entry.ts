type ClickObserver = (entry: SidenavEntry) => void;

export class SidenavEntry {
    private active: boolean;
    private clickObserverList: ClickObserver[] = [];

    constructor(public readonly htmlElement: HTMLElement) {
        this.htmlElement.addEventListener('click', () => {
            for (const observer of this.clickObserverList) {
                observer(this);
            }
        });
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

    observeClick(observer: ClickObserver) {
        this.clickObserverList.push(observer);
    }
}
