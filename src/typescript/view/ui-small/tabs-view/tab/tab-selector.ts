import { Checkbox, CheckboxShiftClickObserver, CheckboxStateChangeObserver } from '../../../components/checkbox';

export { CheckboxShiftClickObserver, CheckboxStateChangeObserver };

export class TabSelector extends Checkbox {
    constructor(private tabElement: HTMLElement, tabSelectorContainer: HTMLElement, openedTabId: string) {
        super(tabSelectorContainer, openedTabId);
    }

    markAsChecked() {
        super.markAsChecked();
        this.tabElement.classList.add('selected');
    }

    markAsUnchecked() {
        super.markAsUnchecked();
        this.tabElement.classList.remove('selected');
    }
}
