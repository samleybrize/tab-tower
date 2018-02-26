export type MoveBelowClickCallback = (clickedElement: HTMLAnchorElement) => void;
export type MoveAboveOthersClickCallback = () => void;

export class TabMoveAction {
    private tabRowsToMove: HTMLElement[] = null;

    constructor(private root: HTMLElement) {
    }

    createBeingMovedIndicator() {
        const beingMovedIndicator = document.createElement('div');
        beingMovedIndicator.classList.add('beingMovedIndicator');
        beingMovedIndicator.innerHTML = '<i class="material-icons">swap_vert</i>';

        return beingMovedIndicator;
    }

    createCancelButton() {
        const cancelElement = document.createElement('div');
        cancelElement.classList.add('moveModeCancel');
        cancelElement.innerHTML = '<a data-tooltip="Cancel tab move"><i class="material-icons">close</i></a>';

        const cancelButton = cancelElement.querySelector('a');
        cancelButton.addEventListener('click', async () => {
            this.disableMoveMode();
        });

        jQuery(cancelButton).tooltip();

        return cancelElement;
    }

    createMoveBelowButton(clickCallback: MoveBelowClickCallback) {
        const moveBelowButton = document.createElement('a');
        moveBelowButton.classList.add('moveBelow');
        moveBelowButton.innerHTML = `Move below <i class="material-icons">arrow_downward</i>`;
        moveBelowButton.addEventListener('click', () => {
            clickCallback(moveBelowButton);

            this.disableMoveMode();
        });

        return moveBelowButton;
    }

    createMoveAboveOthersButton(clickCallback: MoveAboveOthersClickCallback) {
        const moveAboveOthersButton = document.createElement('a');
        moveAboveOthersButton.classList.add('moveAboveOthers');
        moveAboveOthersButton.innerHTML = `Move above others <i class="material-icons">arrow_downward</i>`;
        moveAboveOthersButton.addEventListener('click', () => {
            clickCallback();

            this.disableMoveMode();
        });

        return moveAboveOthersButton;
    }

    enableMoveMode(tabRowsToMove: HTMLElement[]) {
        this.tabRowsToMove = tabRowsToMove;
        this.root.classList.add('moveMode');

        for (const row of tabRowsToMove) {
            row.classList.add('beingMoved');
        }
    }

    disableMoveMode() {
        this.tabRowsToMove = null;
        this.root.classList.remove('moveMode');
        const beingMovedList = Array.from(this.root.querySelectorAll('.beingMoved'));

        for (const row of beingMovedList) {
            row.classList.remove('beingMoved');
        }
    }

    getTabRowsToMove() {
        return this.tabRowsToMove;
    }
}
