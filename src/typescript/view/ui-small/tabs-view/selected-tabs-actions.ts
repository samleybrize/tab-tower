import { SelectedTabsActionsContextMenu, SelectedTabsActionsContextMenuFactory } from './selected-tabs-actions-context-menu';

export class SelectedTabsActions {
    private selectedTabsActionsContextMenu: SelectedTabsActionsContextMenu;

    constructor(private contextMenuOpenerElement: HTMLElement, selectedTabsActionsContextMenuFactory: SelectedTabsActionsContextMenuFactory) {
        this.selectedTabsActionsContextMenu = selectedTabsActionsContextMenuFactory.create(contextMenuOpenerElement);
        this.contextMenuOpenerElement.addEventListener('click', () => {
            this.selectedTabsActionsContextMenu.open();
        });

        this.hide();
    }

    showContextMenuOpener() {
        this.contextMenuOpenerElement.classList.remove('hide');
    }

    hide() {
        this.contextMenuOpenerElement.classList.add('hide');
        this.selectedTabsActionsContextMenu.close();
    }
}

export class SelectedTabsActionsFactory {
    constructor(private selectedTabsActionsContextMenuFactory: SelectedTabsActionsContextMenuFactory) {
    }

    create(buttonElement: HTMLElement) {
        return new SelectedTabsActions(buttonElement, this.selectedTabsActionsContextMenuFactory);
    }
}
