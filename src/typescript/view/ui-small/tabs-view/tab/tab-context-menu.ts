import { CommandBus } from '../../../../bus/command-bus';
import { CloseOpenedTab } from '../../../../tab/opened-tab/command/close-opened-tab';
import { DiscardOpenedTab } from '../../../../tab/opened-tab/command/discard-opened-tab';
import { DuplicateOpenedTab } from '../../../../tab/opened-tab/command/duplicate-opened-tab';
import { MuteOpenedTab } from '../../../../tab/opened-tab/command/mute-opened-tab';
import { PinOpenedTab } from '../../../../tab/opened-tab/command/pin-opened-tab';
import { ReloadOpenedTab } from '../../../../tab/opened-tab/command/reload-opened-tab';
import { UnmuteOpenedTab } from '../../../../tab/opened-tab/command/unmute-opened-tab';
import { UnpinOpenedTab } from '../../../../tab/opened-tab/command/unpin-opened-tab';
import { BoundingRectangle, ContextMenu, ContextMenuDimensions, ContextMenuFactory, ContextMenuPosition, ContextMenuPositionArrowEdge, ContextMenuPositionCalculator } from '../../../components/context-menu';
import { MarkTabsAsBeingMoved } from '../command/mark-tabs-as-being-moved';

interface Position {
    x: number;
    y: number;
}

export class TabContextMenu {
    private contextMenu: ContextMenu;
    private positionCalculator: TabContextMenuPositionCalculator;
    private content: HTMLElement;
    private pinButtonElement: HTMLElement;
    private unpinButtonElement: HTMLElement;
    private muteButtonElement: HTMLElement;
    private unmuteButtonElement: HTMLElement;
    private discardButtonElement: HTMLElement;

    constructor(private tabElement: HTMLElement, private openedTabId: string, private commandBus: CommandBus, contextMenuFactory: ContextMenuFactory) {
        this.content = document.createElement('div');

        this.positionCalculator = new TabContextMenuPositionCalculator(tabElement);
        this.contextMenu = contextMenuFactory.create(this.content, this.positionCalculator);

        this.content.style.overflowY = 'auto';
        this.content.innerHTML = `
            <ul>
                <li class="clickable manage-tags-button"><i class="material-icons">label</i> Manage tags...</li>
                <li class="clickable reload-button"><i class="material-icons">autorenew</i> Reload</li>
                <li class="clickable mute-button"><i class="material-icons">volume_off</i> Mute</li>
                <li class="clickable unmute-button hide"><i class="material-icons">volume_up</i> Unmute</li>
                <li class="clickable pin-button"><i class="material-icons">stars</i> Pin</li>
                <li class="clickable unpin-button hide"><i class="material-icons">stars</i> Unpin</li>
                <li class="clickable duplicate-button"><i class="material-icons">content_copy</i> Duplicate</li>
                <li class="clickable discard-button"><i class="material-icons">power_settings_new</i> Suspend</li>
                <li class="clickable move-button"><i class="material-icons">swap_vert</i> Move</li>
                <li class="clickable close-button"><i class="material-icons">close</i> Close</li>
            </ul>
        `;

        this.pinButtonElement = this.content.querySelector('.pin-button');
        this.unpinButtonElement = this.content.querySelector('.unpin-button');
        this.muteButtonElement = this.content.querySelector('.mute-button');
        this.unmuteButtonElement = this.content.querySelector('.unmute-button');
        this.discardButtonElement = this.content.querySelector('.discard-button');

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
        buttonElement.addEventListener('click', () => {
            // this.commandBus.handle(new ReloadOpenedTab(this.openedTabId)); // TODO
            this.contextMenu.close();
        });
    }

    private initReloadButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new ReloadOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initMuteButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new MuteOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initUnmuteButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new UnmuteOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initPinButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new PinOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initUnpinButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new UnpinOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initDuplicateButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new DuplicateOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initDiscardButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new DiscardOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    private initMoveButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new MarkTabsAsBeingMoved([this.openedTabId]));
            this.contextMenu.close();
        });
    }

    private initCloseButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.commandBus.handle(new CloseOpenedTab(this.openedTabId));
            this.contextMenu.close();
        });
    }

    get htmlElement() {
        return this.contextMenu.htmlElement;
    }

    open(targetPosition: Position) {
        this.content.style.maxHeight = (window.innerHeight * 0.33) + 'px';
        this.positionCalculator.setTargetPosition(targetPosition);
        this.contextMenu.open();
        this.tabElement.classList.add('context-menu-visible');
    }

    private onClose() {
        this.tabElement.classList.remove('context-menu-visible');
    }

    showPinButton() {
        this.pinButtonElement.classList.remove('hide');
        this.unpinButtonElement.classList.add('hide');
    }

    showUnpinButton() {
        this.pinButtonElement.classList.add('hide');
        this.unpinButtonElement.classList.remove('hide');
    }

    showMuteButton() {
        this.muteButtonElement.classList.remove('hide');
        this.unmuteButtonElement.classList.add('hide');
    }

    showUnmuteButton() {
        this.muteButtonElement.classList.add('hide');
        this.unmuteButtonElement.classList.remove('hide');
    }

    showDiscardButton() {
        this.discardButtonElement.classList.remove('hide');
    }

    hideDiscardButton() {
        this.discardButtonElement.classList.add('hide');
    }
}

class TabContextMenuPositionCalculator implements ContextMenuPositionCalculator {
    private targetPosition: Position;

    constructor(private tabElement: HTMLElement) {
        this.setTargetPosition({x: 0, y: 0});
    }

    setTargetPosition(targetPosition: Position) {
        this.targetPosition = {
            x: targetPosition.x,
            y: targetPosition.y,
        };
    }

    getPosition(contextMenuDimensions: ContextMenuDimensions, boundingRectangle: BoundingRectangle): ContextMenuPosition {
        const tabPosition = this.tabElement.getBoundingClientRect();
        let targetY = 0;
        let arrowEdge: ContextMenuPositionArrowEdge = 'none';

        if (tabPosition.bottom + contextMenuDimensions.height < boundingRectangle.bottom) {
            targetY = tabPosition.bottom + (contextMenuDimensions.arrowHeight / 2);
            arrowEdge = 'top';
        } else if (tabPosition.top - contextMenuDimensions.height > boundingRectangle.top) {
            targetY = tabPosition.top - contextMenuDimensions.height - (contextMenuDimensions.arrowHeight / 2);
            arrowEdge = 'bottom';
        } else {
            targetY = 0;
            arrowEdge = 'bottom';
        }

        const targetX = Math.max(
            0,
            Math.min(boundingRectangle.right - contextMenuDimensions.width, this.targetPosition.x - 40),
        );

        return {
            x: targetX,
            y: targetY,
            arrowEdge,
        };
    }
}

export class TabContextMenuFactory {
    constructor(private commandBus: CommandBus, private contextMenuFactory: ContextMenuFactory) {
    }

    create(tabElement: HTMLElement, openedTabId: string) {
        return new TabContextMenu(tabElement, openedTabId, this.commandBus, this.contextMenuFactory);
    }
}
