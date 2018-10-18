import { CommandBus } from '../../../bus/command-bus';
import { ColorManipulator } from '../../../utils/color-maniplator';
import { ShowTagTabs } from '../tabs-view/command/show-tag-tabs';
import { SidenavEntry } from './sidenav-entry';
import { TabTagContextMenuFactory } from './tab-tag-context-menu';

export class TabTagEntry extends SidenavEntry {
    private labelElement: HTMLElement;
    private colorElement: HTMLElement;

    constructor(
        private commandBus: CommandBus,
        tabTagContextMenuFactory: TabTagContextMenuFactory,
        private colorManipulator: ColorManipulator,
        public readonly id: string,
        private label: string,
        private hexColor?: string,
    ) {
        super(TabTagEntry.createElement());

        this.labelElement = this.htmlElement.querySelector('.label');
        this.colorElement = this.htmlElement.querySelector('.color');

        this.updateLabel(label);
        this.updateColor(hexColor);

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

    getHexColor() {
        return this.hexColor;
    }

    updateLabel(label: string) {
        this.label = label;
        this.labelElement.textContent = label;
        this.labelElement.setAttribute('title', label);
    }

    updateColor(hexColor?: string) {
        if (hexColor) {
            const strokeColor = this.colorManipulator.darken(hexColor, 20);
            this.hexColor = hexColor;
            this.colorElement.style.color = `#${hexColor}`;
            this.colorElement.style.webkitTextStroke = `1px #${strokeColor}`;
        } else {
            this.hexColor = null;
            this.colorElement.style.color = null;
            this.colorElement.style.webkitTextStroke = null;
        }
    }

    hide() {
        this.htmlElement.classList.add('hide');
    }

    unhide() {
        this.htmlElement.classList.remove('hide');
    }
}

export class TabTagEntryFactory {
    constructor(private commandBus: CommandBus, private tabTagContextMenuFactory: TabTagContextMenuFactory, private colorManipulator: ColorManipulator) {
    }

    create(id: string, label: string, hexColor?: string) {
        return new TabTagEntry(this.commandBus, this.tabTagContextMenuFactory, this.colorManipulator, id, label, hexColor);
    }
}
