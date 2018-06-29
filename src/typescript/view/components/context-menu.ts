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

type HideObserver = () => void;

export class ContextMenu {
    private static currentlyShownMenu: ContextMenu = null;

    readonly htmlElement: HTMLElement;
    readonly overlayElement: HTMLElement;
    private arrowElement: HTMLElement;
    private hideObserverList: HideObserver[] = [];

    constructor(content: HTMLElement, private positionCalculator: ContextMenuPositionCalculator) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add('context-menu');
        this.htmlElement.classList.add('hide');
        this.htmlElement.appendChild(content);
        this.setArrowEdge('top');

        this.arrowElement = document.createElement('div');
        this.arrowElement.classList.add('arrow');
        this.htmlElement.appendChild(this.arrowElement);

        this.overlayElement = this.createOrRetrieveOverlay();
    }

    private createOrRetrieveOverlay() {
        const existingOverlay = document.querySelector('.context-menu-overlay') as HTMLElement;

        if (existingOverlay) {
            return existingOverlay;
        } else {
            const overlayElement = document.createElement('div');
            overlayElement.classList.add('context-menu-overlay');
            overlayElement.classList.add('hide');
            document.querySelector('body').appendChild(overlayElement);

            overlayElement.addEventListener('click', this.hideCurrentlyShownMenu.bind(this));
            overlayElement.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this.hideCurrentlyShownMenu();
            });

            return overlayElement;
        }
    }

    private hideCurrentlyShownMenu() {
        if (ContextMenu.currentlyShownMenu) {
            ContextMenu.currentlyShownMenu.hide();
        }
    }

    private setArrowEdge(arrowEdge: ContextMenuPositionArrowEdge) {
        this.htmlElement.setAttribute('data-arrow-edge', arrowEdge);
    }

    show() {
        this.hideCurrentlyShownMenu();

        const boundingRectangle = this.getWindowBoundingRectangle();
        const contextMenuDimensions = this.getContextMenuDimensions();
        const targetPosition = this.positionCalculator.getPosition(contextMenuDimensions, boundingRectangle);

        this.setArrowEdge(targetPosition.arrowEdge);

        this.htmlElement.style.top = `${targetPosition.y}px`;
        this.htmlElement.style.left = `${targetPosition.x}px`;
        this.htmlElement.classList.remove('hide');
        this.overlayElement.classList.remove('hide');

        ContextMenu.currentlyShownMenu = this;
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

        return {
            width: boxDimensions.width,
            height: boxDimensions.height,
            arrowWidth: arrowDimensions.width / 2,
            arrowHeight: arrowDimensions.height / 2,
        };
    }

    hide() {
        this.htmlElement.classList.add('hide');
        this.overlayElement.classList.add('hide');

        if (ContextMenu.currentlyShownMenu === this) {
            ContextMenu.currentlyShownMenu = null;
        }

        for (const observer of this.hideObserverList) {
            observer();
        }
    }

    observeHide(observer: HideObserver) {
        this.hideObserverList.push(observer);
    }
}
