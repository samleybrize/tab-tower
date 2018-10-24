import { CommandBus } from '../../../bus/command-bus';
import { QueryBus } from '../../../bus/query-bus';
import { CloseOpenedTab } from '../../../tab/opened-tab/command/close-opened-tab';
import { DiscardOpenedTab } from '../../../tab/opened-tab/command/discard-opened-tab';
import { DuplicateOpenedTab } from '../../../tab/opened-tab/command/duplicate-opened-tab';
import { MuteOpenedTab } from '../../../tab/opened-tab/command/mute-opened-tab';
import { PinOpenedTab } from '../../../tab/opened-tab/command/pin-opened-tab';
import { ReloadOpenedTab } from '../../../tab/opened-tab/command/reload-opened-tab';
import { UnmuteOpenedTab } from '../../../tab/opened-tab/command/unmute-opened-tab';
import { UnpinOpenedTab } from '../../../tab/opened-tab/command/unpin-opened-tab';
import { BoundingRectangle, ContextMenu, ContextMenuDimensions, ContextMenuFactory, ContextMenuPosition, ContextMenuPositionArrowEdge, ContextMenuPositionCalculator } from '../../components/context-menu';
import { MarkTabsAsBeingMoved } from './command/mark-tabs-as-being-moved';
import { GetCurrentTabListSelectedTabs } from './query/get-current-tab-list-selected-tabs';

export class SelectedTabsActionsContextMenu {
    private contextMenu: ContextMenu;
    private content: HTMLElement;

    constructor(
        containerElement: HTMLElement,
        private contextMenuOpenerElement: HTMLElement,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        contextMenuFactory: ContextMenuFactory,
    ) {
        this.content = document.createElement('div');

        const positionCalculator = new PositionCalculator();
        this.contextMenu = contextMenuFactory.create(this.content, positionCalculator);
        this.contextMenu.setArrowEdge('bottom');

        this.content.style.overflowY = 'auto';
        this.content.innerHTML = `
            <ul>
                <li class="clickable manage-tags-button"><i class="material-icons">label</i> Manage tags...</li>
                <li class="clickable reload-button"><i class="material-icons">autorenew</i> Reload</li>
                <li class="clickable mute-button"><i class="material-icons">volume_off</i> Mute</li>
                <li class="clickable unmute-button"><i class="material-icons">volume_up</i> Unmute</li>
                <li class="clickable pin-button"><i class="material-icons">stars</i> Pin</li>
                <li class="clickable unpin-button"><i class="material-icons">stars</i> Unpin</li>
                <li class="clickable duplicate-button"><i class="material-icons">content_copy</i> Duplicate</li>
                <li class="clickable discard-button"><i class="material-icons">power_settings_new</i> Suspend</li>
                <li class="clickable move-button"><i class="material-icons">swap_vert</i> Move</li>
                <li class="clickable close-button"><i class="material-icons">close</i> Close</li>
            </ul>
        `;

        containerElement.appendChild(this.contextMenu.htmlElement);

        this.contextMenu.observeClose(this.onClose.bind(this));

        this.initManageTagsButton(this.content.querySelector('.manage-tags-button'));
        this.initReloadButton(this.content.querySelector('.reload-button'));
        this.initMuteButton(this.content.querySelector('.mute-button'));
        this.initUnmuteButton(this.content.querySelector('.unmute-button'));
        this.initPinButton(this.content.querySelector('.pin-button'));
        this.initUnpinButton(this.content.querySelector('.unpin-button'));
        this.initDuplicateButton(this.content.querySelector('.duplicate-button'));
        this.initDiscardButton(this.content.querySelector('.discard-button'));
        this.initMoveButton(this.content.querySelector('.move-button'));
        this.initCloseButton(this.content.querySelector('.close-button'));
    }

    private initManageTagsButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                // this.commandBus.handle(new ReloadOpenedTab(tabId)); // TODO
            }

            this.contextMenu.close();
        });
    }

    private initReloadButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new ReloadOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private async getSelectedTabIdList() {
        return this.queryBus.query(new GetCurrentTabListSelectedTabs());
    }

    private initMuteButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new MuteOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private initUnmuteButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new UnmuteOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private initPinButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new PinOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private initUnpinButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            let tabIdList = await this.getSelectedTabIdList();
            tabIdList = tabIdList.reverse();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new UnpinOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private initDuplicateButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new DuplicateOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private initDiscardButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new DiscardOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    private initMoveButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();
            this.commandBus.handle(new MarkTabsAsBeingMoved(tabIdList));
            this.contextMenu.close();
        });
    }

    private initCloseButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', async () => {
            const tabIdList = await this.getSelectedTabIdList();

            for (const tabId of tabIdList) {
                this.commandBus.handle(new CloseOpenedTab(tabId));
            }

            this.contextMenu.close();
        });
    }

    get htmlElement() {
        return this.contextMenu.htmlElement;
    }

    open() {
        this.content.style.maxHeight = (window.innerHeight * 0.8) + 'px';
        this.contextMenu.open();
        this.contextMenuOpenerElement.classList.add('context-menu-visible');
    }

    close() {
        this.contextMenu.close();
    }

    private onClose() {
        this.contextMenuOpenerElement.classList.remove('context-menu-visible');
    }
}

class PositionCalculator implements ContextMenuPositionCalculator {
    getPosition(contextMenuDimensions: ContextMenuDimensions, boundingRectangle: BoundingRectangle): ContextMenuPosition {
        return null;
    }
}

export class SelectedTabsActionsContextMenuFactory {
    constructor(private commandBus: CommandBus, private queryBus: QueryBus, private contextMenuFactory: ContextMenuFactory, private containerElement: HTMLElement) {
    }

    create(contextMenuOpenerElement: HTMLElement) {
        return new SelectedTabsActionsContextMenu(this.containerElement, contextMenuOpenerElement, this.commandBus, this.queryBus, this.contextMenuFactory);
    }
}
