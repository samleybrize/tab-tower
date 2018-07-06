import { EventBus } from '../../bus/event-bus';
import { ContextMenuClosed } from './event/context-menu-closed';
import { ContextMenuOpened } from './event/context-menu-opened';

export interface ContextMenuDimensions {
    readonly width: number;
    readonly height: number;
    readonly arrowWidth: number;
    readonly arrowHeight: number;
}

export interface BoundingRectangle {
    readonly top: number;
    readonly left: number;
    readonly bottom: number;
    readonly right: number;
}

export interface ContextMenuPosition {
    readonly x: number;
    readonly y: number;
    readonly arrowEdge: ContextMenuPositionArrowEdge;
}

export type ContextMenuPositionArrowEdge = 'top'|'left'|'bottom'|'right'|'none';

export interface ContextMenuPositionCalculator {
    getPosition(contextMenuDimensions: ContextMenuDimensions, boundingRectangle: BoundingRectangle): ContextMenuPosition;
}

type CloseObserver = (contextMenu: ContextMenu) => void;

export class ContextMenu {
    readonly htmlElement: HTMLElement;
    private arrowElement: HTMLElement;
    private closeObserverList: CloseObserver[] = [];

    constructor(content: HTMLElement, private positionCalculator: ContextMenuPositionCalculator, private eventBus: EventBus) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add('context-menu');
        this.htmlElement.classList.add('hide');
        this.htmlElement.appendChild(content);
        this.setArrowEdge('top');

        this.arrowElement = document.createElement('div');
        this.arrowElement.classList.add('arrow');
        this.htmlElement.appendChild(this.arrowElement);
    }

    setArrowEdge(arrowEdge: ContextMenuPositionArrowEdge) {
        this.htmlElement.setAttribute('data-arrow-edge', arrowEdge);
    }

    open() {
        const boundingRectangle = this.getWindowBoundingRectangle();
        const contextMenuDimensions = this.getContextMenuDimensions();
        const targetPosition = this.positionCalculator.getPosition(contextMenuDimensions, boundingRectangle);

        if (targetPosition) {
            this.setArrowEdge(targetPosition.arrowEdge);

            this.htmlElement.style.top = `${targetPosition.y}px`;
            this.htmlElement.style.left = `${targetPosition.x}px`;
        }

        this.htmlElement.classList.remove('hide');
        this.eventBus.publish(new ContextMenuOpened(this));
    }

    private getWindowBoundingRectangle(): BoundingRectangle {
        const padding = 5;

        return {
            top: padding,
            left: padding,
            right: window.innerWidth - padding,
            bottom: window.innerHeight - padding,
        };
    }

    private getContextMenuDimensions(): ContextMenuDimensions {
        this.htmlElement.classList.add('instant-show');

        const boxDimensions = this.htmlElement.getBoundingClientRect();
        const arrowDimensions = this.arrowElement.getBoundingClientRect();

        this.htmlElement.classList.remove('instant-show');

        // triggers a repaint, used to not break the animation due to the 'instant-show' css class
        this.htmlElement.getBoundingClientRect();

        return {
            width: boxDimensions.width,
            height: boxDimensions.height,
            arrowWidth: arrowDimensions.width / 2,
            arrowHeight: arrowDimensions.height / 2,
        };
    }

    close() {
        if (this.htmlElement.classList.contains('hide')) {
            return;
        }

        this.htmlElement.classList.add('hide');

        for (const observer of this.closeObserverList) {
            observer(this);
        }

        this.eventBus.publish(new ContextMenuClosed(this));
    }

    observeClose(observer: CloseObserver) {
        this.closeObserverList.push(observer);
    }
}

export class ContextMenuFactory {
    constructor(private eventBus: EventBus) {
    }

    create(content: HTMLElement, positionCalculator: ContextMenuPositionCalculator) {
        return new ContextMenu(content, positionCalculator, this.eventBus);
    }
}
