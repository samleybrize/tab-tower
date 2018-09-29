import { CommandBus } from '../../bus/command-bus';
import { CloseContextMenus } from './command/close-context-menus';
import { ContextMenuClosed } from './event/context-menu-closed';
import { ContextMenuOpened } from './event/context-menu-opened';

export class ContextMenuOverlay {
    readonly htmlElement: HTMLElement;
    private numberOfOpenedContextMenus = 0;

    constructor(private commandBus: CommandBus) {
        const overlayElement = document.createElement('div');
        overlayElement.classList.add('context-menu-overlay');
        overlayElement.classList.add('hide');
        document.querySelector('body').appendChild(overlayElement);

        overlayElement.addEventListener('click', this.closeContextMenus.bind(this));
        overlayElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.closeContextMenus();
        });

        this.htmlElement = overlayElement;
    }

    private closeContextMenus() {
        this.commandBus.handle(new CloseContextMenus());
    }

    async onContextMenuOpen(event: ContextMenuOpened) {
        event.contextMenu.htmlElement.insertAdjacentElement('beforebegin', this.htmlElement);
        this.htmlElement.classList.remove('hide');
        this.numberOfOpenedContextMenus++;
    }

    async onContextMenuClose(event: ContextMenuClosed) {
        this.htmlElement.classList.add('hide');
        this.numberOfOpenedContextMenus--;

        if (0 == this.numberOfOpenedContextMenus) {
            this.closeContextMenus();
        }
    }
}
