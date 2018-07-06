export type CheckboxStateChangeObserver = (id: string, isChecked: boolean) => void;
export type CheckboxShiftClickObserver = (id: string) => void;

export class Checkbox {
    private checkboxElement: HTMLInputElement;
    private checked = false;
    private stateChangeObserverList: CheckboxStateChangeObserver[] = [];
    private shiftClickObserverList: CheckboxShiftClickObserver[] = [];

    constructor(tabSelectorContainer: HTMLElement, private id: string, defaultState?: 'checked'|'unchecked') {
        this.checkboxElement = tabSelectorContainer.querySelector('input') as HTMLInputElement;
        this.checked = this.checkboxElement.checked;

        if ('checked' == defaultState) {
            this.markAsChecked();
        } else if ('unchecked' == defaultState) {
            this.markAsUnchecked();
        }

        this.checkboxElement.addEventListener('change', () => {
            if (this.checkboxElement.checked) {
                this.markAsChecked();
            } else {
                this.markAsUnchecked();
            }

            this.notifySelectStateChange(this.checked);
        });
        tabSelectorContainer.addEventListener('click', async (event: MouseEvent) => {
            if (event.shiftKey) {
                this.toggleChecked();
                this.notifyShiftClick();
            }
        });
    }

    private notifySelectStateChange(isSelected: boolean) {
        for (const observer of this.stateChangeObserverList) {
            observer(this.id, isSelected);
        }
    }

    private notifyShiftClick() {
        for (const observer of this.shiftClickObserverList) {
            observer(this.id);
        }
    }

    isChecked() {
        return this.checked;
    }

    markAsChecked() {
        if (this.checked) {
            return;
        }

        this.checkboxElement.setAttribute('checked', 'checked');
        this.checkboxElement.checked = true;
        this.checked = true;
    }

    markAsUnchecked() {
        if (!this.checked) {
            return;
        }

        this.checkboxElement.removeAttribute('checked');
        this.checkboxElement.checked = false;
        this.checked = false;
    }

    toggleChecked() {
        if (this.checkboxElement.checked) {
            this.markAsUnchecked();
        } else {
            this.markAsChecked();
        }
    }

    observeStateChange(observer: CheckboxStateChangeObserver) {
        this.stateChangeObserverList.push(observer);
    }

    observeShiftClick(observer: CheckboxShiftClickObserver) {
        this.shiftClickObserverList.push(observer);
    }
}
