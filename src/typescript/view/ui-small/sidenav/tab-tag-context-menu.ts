import { CommandBus } from '../../../bus/command-bus';
import { DeleteTabTag } from '../../../tab/tab-tag/command/delete-tab-tag';
import { BoundingRectangle, ContextMenu, ContextMenuDimensions, ContextMenuFactory, ContextMenuPosition, ContextMenuPositionArrowEdge, ContextMenuPositionCalculator } from '../../components/context-menu';
import { ShowEditTabTagForm } from '../tab-tag-edit-form/command/show-edit-tab-tag-form.ts';

interface Position {
    x: number;
    y: number;
}

export class TabTagContextMenu {
    private contextMenu: ContextMenu;
    private deleteContextMenu: TabTagDeleteContextMenu;
    private positionCalculator: TabTagContextMenuPositionCalculator;
    private content: HTMLElement;
    private groupElement: HTMLElement; // TODO rename

    constructor(private tagElement: HTMLElement, private tagId: string, private commandBus: CommandBus, contextMenuFactory: ContextMenuFactory) {
        this.content = document.createElement('div');

        this.positionCalculator = new TabTagContextMenuPositionCalculator(tagElement);
        this.contextMenu = contextMenuFactory.create(this.content, this.positionCalculator);

        this.content.style.overflowY = 'auto';
        this.content.innerHTML = `
            <ul>
                <li class="clickable edit-button"><i class="material-icons">edit</i> Edit</li>
                <li class="clickable delete-button"><i class="material-icons">close</i> Delete</li>
            </ul>
        `;

        this.contextMenu.observeClose(this.onClose.bind(this));

        this.initEditButton(this.content.querySelector('.edit-button'));
        this.initDeleteButton(this.content.querySelector('.delete-button'));

        this.deleteContextMenu = new TabTagDeleteContextMenu(tagElement, tagId, commandBus, contextMenuFactory);
        this.groupElement = document.createElement('div');
        this.groupElement.appendChild(this.contextMenu.htmlElement);
        this.groupElement.appendChild(this.deleteContextMenu.htmlElement);
    }

    private initEditButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.contextMenu.close();
            this.commandBus.handle(new ShowEditTabTagForm(this.tagId));
        });
    }

    private initDeleteButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.contextMenu.close();
            this.deleteContextMenu.open(this.positionCalculator.getTargetPosition());
        });
    }

    get htmlElement() {
        return this.groupElement;
    }

    open(targetPosition: Position) {
        this.content.style.maxHeight = (window.innerHeight * 0.33) + 'px';
        this.positionCalculator.setTargetPosition(targetPosition);
        this.contextMenu.open();
        this.tagElement.classList.add('context-menu-visible');
    }

    private onClose() {
        this.tagElement.classList.remove('context-menu-visible');
    }
}

class TabTagDeleteContextMenu {
    private contextMenu: ContextMenu;
    private positionCalculator: TabTagContextMenuPositionCalculator;
    private content: HTMLElement;

    constructor(private tagElement: HTMLElement, private tagId: string, private commandBus: CommandBus, contextMenuFactory: ContextMenuFactory) {
        this.content = document.createElement('div');

        this.positionCalculator = new TabTagContextMenuPositionCalculator(tagElement);
        this.contextMenu = contextMenuFactory.create(this.content, this.positionCalculator);

        this.content.style.overflowY = 'auto';
        this.content.innerHTML = `
            <div class="delete-confirmation">
                <span>Do you really want to delete it?</span>
                <div>
                    <i class="material-icons yes">check_circle</i>
                    <i class="material-icons no">cancel</i>
                </div>
            </div>
        `;

        this.contextMenu.observeClose(this.onClose.bind(this));

        this.initYesButton(this.content.querySelector('.yes'));
        this.initNoButton(this.content.querySelector('.no'));
    }

    private initYesButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
            this.contextMenu.close();
            this.commandBus.handle(new DeleteTabTag(this.tagId));
        });
    }

    private initNoButton(buttonElement: HTMLElement) {
        buttonElement.addEventListener('click', () => {
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
        this.tagElement.classList.add('context-menu-visible');
    }

    private onClose() {
        this.tagElement.classList.remove('context-menu-visible');
    }
}

// TODO similar to TabContextMenuPositionCalculator
class TabTagContextMenuPositionCalculator implements ContextMenuPositionCalculator {
    private targetPosition: Position;

    constructor(private tagElement: HTMLElement) {
        this.setTargetPosition({x: 0, y: 0});
    }

    getTargetPosition() {
        return this.targetPosition;
    }

    setTargetPosition(targetPosition: Position) {
        this.targetPosition = {
            x: targetPosition.x,
            y: targetPosition.y,
        };
    }

    getPosition(contextMenuDimensions: ContextMenuDimensions, boundingRectangle: BoundingRectangle): ContextMenuPosition {
        const tabPosition = this.tagElement.getBoundingClientRect();
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

export class TabTagContextMenuFactory {
    constructor(private commandBus: CommandBus, private contextMenuFactory: ContextMenuFactory) {
    }

    create(tabElement: HTMLElement, tagId: string) {
        return new TabTagContextMenu(tabElement, tagId, this.commandBus, this.contextMenuFactory);
    }
}
