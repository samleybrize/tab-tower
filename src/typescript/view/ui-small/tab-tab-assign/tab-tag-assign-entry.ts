import { Checkbox3, CheckboxState, CheckboxStateChangeObserver } from '../../components/checkbox3';

export { CheckboxState };

export class TabTagAssignEntry {
    public readonly htmlElement: HTMLElement;
    private labelElement: HTMLElement;
    private checkbox: Checkbox3;

    constructor(
        public readonly id: string,
        private label: string,
        private colorId: number,
    ) {
        this.htmlElement = this.createElement();
        this.labelElement = this.htmlElement.querySelector('.label');

        this.checkbox = new Checkbox3(id, 'unchecked');
        this.htmlElement.insertAdjacentElement('afterbegin', this.checkbox.htmlElement);

        this.updateLabel(label);
        this.updateColor(colorId);
    }

    private createElement() {
        const htmlElement = document.createElement('div');
        htmlElement.classList.add('row');
        htmlElement.classList.add('tab-tag');
        htmlElement.innerHTML = `
            <span class="color"><i class="material-icons">label</i></span>
            <span class="label">Label</span>
        `;

        return htmlElement;
    }

    getLabel() {
        return this.label;
    }

    getColorId() {
        return this.colorId;
    }

    updateLabel(label: string) {
        this.label = label;
        this.labelElement.textContent = label;
        this.labelElement.setAttribute('title', label);
    }

    updateColor(colorId: number) {
        this.colorId = colorId;
        this.htmlElement.setAttribute('data-color', '' + colorId);
    }

    hide() {
        this.htmlElement.classList.add('hide');
    }

    unhide() {
        this.htmlElement.classList.remove('hide');
    }

    markAsChecked() {
        this.checkbox.markAsChecked();
    }

    markAsUnchecked() {
        this.checkbox.markAsUnchecked();
    }

    markAsIndeterminate() {
        this.checkbox.markAsIndeterminate();
    }

    observeCheckStateChange(observer: CheckboxStateChangeObserver) {
        this.checkbox.observeStateChange(observer);
    }
}

export class TabTagAssignEntryFactory {
    create(id: string, label: string, colorId: number) {
        return new TabTagAssignEntry(id, label, colorId);
    }
}
