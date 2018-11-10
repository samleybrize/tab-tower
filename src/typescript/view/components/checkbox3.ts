export type CheckboxStateChangeObserver = (id: string, state: CheckboxState) => void;
export type CheckboxShiftClickObserver = (id: string) => void;
export type CheckboxState = 'checked'|'unchecked'|'indeterminate';

export class Checkbox3 {
    public readonly htmlElement: HTMLElement;
    private state: CheckboxState;
    private stateChangeObserverList: CheckboxStateChangeObserver[] = [];
    private shiftClickObserverList: CheckboxShiftClickObserver[] = [];

    constructor(private id: string, defaultState: CheckboxState) {
        this.htmlElement = this.createElement();

        if ('checked' == defaultState) {
            this.markAsChecked();
        } else if ('indeterminate' == defaultState) {
            this.markAsIndeterminate();
        } else {
            this.markAsUnchecked();
        }

        this.htmlElement.addEventListener('click', async (event: MouseEvent) => {
            this.toggleChecked();

            if (event.shiftKey) {
                this.notifyShiftClick();
            }
        });
    }

    private createElement() {
        const htmlElement = document.createElement('span');
        htmlElement.classList.add('checkbox');
        htmlElement.innerHTML = `
            <span class="material-icons checked-icon" for="">check_box</span>
            <span class="material-icons unchecked-icon" for="">check_box_outline_blank</span>
            <span class="material-icons indeterminate-icon" for="">indeterminate_check_box</span>
        `;

        return htmlElement;
    }

    private notifyStateChange(state: CheckboxState) {
        for (const observer of this.stateChangeObserverList) {
            observer(this.id, state);
        }
    }

    private notifyShiftClick() {
        for (const observer of this.shiftClickObserverList) {
            observer(this.id);
        }
    }

    isChecked() {
        return 'checked' === this.state;
    }

    isUnchecked() {
        return 'unchecked' === this.state;
    }

    isIndeterminate() {
        return 'indeterminate' === this.state;
    }

    markAsChecked() {
        if (this.isChecked()) {
            return;
        }

        this.htmlElement.setAttribute('state', 'checked');
        this.state = 'checked';
        this.notifyStateChange('checked');
    }

    markAsUnchecked() {
        if (this.isUnchecked()) {
            return;
        }

        this.htmlElement.setAttribute('state', 'unchecked');
        this.state = 'unchecked';
        this.notifyStateChange('unchecked');
    }

    markAsIndeterminate() {
        if (this.isIndeterminate()) {
            return;
        }

        this.htmlElement.setAttribute('state', 'indeterminate');
        this.state = 'indeterminate';
        this.notifyStateChange('indeterminate');
    }

    toggleChecked() {
        if (this.isChecked()) {
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
