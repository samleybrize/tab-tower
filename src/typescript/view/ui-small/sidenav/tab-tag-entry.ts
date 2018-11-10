import { SidenavEntry } from './sidenav-entry';
import { TabTagContextMenuFactory } from './tab-tag-context-menu';

export class TabTagEntry extends SidenavEntry {
    private labelElement: HTMLElement;
    private colorElement: HTMLElement;

    constructor(
        tabTagContextMenuFactory: TabTagContextMenuFactory,
        public readonly id: string,
        private label: string,
        private colorId: number,
    ) {
        super(TabTagEntry.createElement());

        this.labelElement = this.htmlElement.querySelector('.label');
        this.colorElement = this.htmlElement.querySelector('.color');

        this.updateLabel(label);
        this.updateColor(colorId);

        this.initElement(tabTagContextMenuFactory);
    }

    private static createElement() {
        const htmlElement = document.createElement('div');
        htmlElement.classList.add('tab-tag');
        htmlElement.classList.add('row');
        htmlElement.innerHTML = `
            <span class="color"><i class="material-icons">label</i></span>
            <span class="label"></span>
        `;

        return htmlElement;
    }

    private initElement(tabTagContextMenuFactory: TabTagContextMenuFactory) {
        const contextMenu = tabTagContextMenuFactory.create(this.htmlElement, this.id);
        this.htmlElement.appendChild(contextMenu.htmlElement);

        this.htmlElement.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
            contextMenu.open({x: event.clientX, y: event.clientY});
        });
    }

    getLabel() {
        return this.label;
    }

    getColorId() {
        return this.colorId;
    }

    updateLabel(label: string) {
        this.label = label;
        this.labelElement.textContent = label;
        this.labelElement.setAttribute('title', label);
    }

    updateColor(colorId: number) {
        this.colorElement.classList.remove(`color-${this.colorId}`);
        this.colorId = colorId;
        this.colorElement.classList.add(`color-${colorId}`);
    }

    hide() {
        this.htmlElement.classList.add('hide');
    }

    unhide() {
        this.htmlElement.classList.remove('hide');
    }
}

export class TabTagEntryFactory {
    constructor(private tabTagContextMenuFactory: TabTagContextMenuFactory) {
    }

    create(id: string, label: string, colorId: number) {
        return new TabTagEntry(this.tabTagContextMenuFactory, id, label, colorId);
    }
}
