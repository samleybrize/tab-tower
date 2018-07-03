import { CloseContextMenus } from './command/close-context-menus';
import { ContextMenu } from './context-menu';
import { ContextMenuClosed } from './event/context-menu-closed';
import { ContextMenuOpened } from './event/context-menu-opened';

export class CurrentlyVisibleContextMenuCloser {
    private currentlyVisibleMenu: ContextMenu = null;

    async onContextMenuOpen(event: ContextMenuOpened) {
        if (this.currentlyVisibleMenu) {
            this.currentlyVisibleMenu.close();
        }

        this.currentlyVisibleMenu = event.contextMenu;
    }

    async onContextMenuClose(event: ContextMenuClosed) {
        this.currentlyVisibleMenu = null;
    }

    async close(command: CloseContextMenus) {
        if (this.currentlyVisibleMenu) {
            this.currentlyVisibleMenu.close();
        }
    }
}
