import { EventBus } from '../bus/event-bus';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';

export class TabFilterView {
    private inputElement: HTMLInputElement;
    private resetButton: HTMLElement;

    constructor(private eventBus: EventBus, private containerElement: HTMLInputElement) {
        if (null == containerElement) {
            throw new Error('null input element received');
        }

        this.inputElement = containerElement.querySelector('input');
        this.resetButton = containerElement.querySelector('.resetButton');
    }

    init() {
        // TODO on focus lost, or click on the reset button, if no filter text, hide input
        this.containerElement.addEventListener('click', () => {
            this.containerElement.classList.remove('collapsed');
            this.inputElement.focus();
        });
        this.resetButton.addEventListener('click', (event) => {
            event.stopPropagation();

            this.inputElement.value = '';
            this.inputElement.blur();
            this.containerElement.classList.add('collapsed');
        });
        this.inputElement.addEventListener('blur', (event) => {
            if ('' == this.inputElement.value) {
                this.containerElement.classList.add('collapsed');
            }
        });
        this.inputElement.addEventListener('focus', (event) => {
            this.containerElement.classList.remove('collapsed');
        });
        this.containerElement.querySelector('label').setAttribute('data-tooltip', 'Filter tabs');
        jQuery(this.containerElement.querySelector('label')).tooltip({});

        let timeoutReference: number = null;
        this.inputElement.addEventListener('input', (event) => {
            if (timeoutReference) {
                clearTimeout(timeoutReference);
            }

            timeoutReference = setTimeout(this.notifyInputChange.bind(this), 300);
        });

        if (this.inputElement.value) {
            // TODO remove collapsed class
            this.notifyInputChange();
        }
    }

    private notifyInputChange() {
        const value = '' + this.inputElement.value;
        const filterTerms = value.toLowerCase().split(' ');

        this.eventBus.publish(new TabFilterRequested(filterTerms));
    }
}
