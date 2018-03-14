import { EventBus } from '../bus/event-bus';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';
import { TabMatcher } from '../tab/tab-matcher';
import { sleep } from '../utils/sleep';

export class TabFilterView {
    private inputElement: HTMLInputElement;
    private labelElement: HTMLLabelElement;
    private resetButton: HTMLElement;

    constructor(private eventBus: EventBus, private tabMatcher: TabMatcher, private containerElement: HTMLInputElement) {
        if (null == containerElement) {
            throw new Error('null input element received');
        }

        this.inputElement = containerElement.querySelector('input');
        this.labelElement = containerElement.querySelector('label');
        this.resetButton = containerElement.querySelector('.resetButton');
    }

    init() {
        this.containerElement.addEventListener('click', () => {
            this.expand();
            this.inputElement.focus();
        });
        this.resetButton.addEventListener('click', (event) => {
            event.stopPropagation();

            this.inputElement.value = '';
            this.inputElement.blur();
            this.collapse();
            this.notifyInputChange();
        });

        this.labelElement.setAttribute('data-tooltip', 'Filter tabs');
        jQuery(this.labelElement).tooltip({});

        this.initInput();
    }

    private async initInput() {
        this.inputElement.addEventListener('blur', (event) => {
            if ('' == this.inputElement.value) {
                this.collapse();
            }
        });
        this.inputElement.addEventListener('focus', (event) => {
            this.expand();
        });

        let timeoutReference: number = null;
        this.inputElement.addEventListener('input', (event) => {
            if (timeoutReference) {
                clearTimeout(timeoutReference);
            }

            timeoutReference = setTimeout(this.notifyInputChange.bind(this), 300);
        });
        this.inputElement.addEventListener('change', this.notifyInputChange.bind(this));

        // needed, otherwise the prefilled-text might not be found at browser start
        await sleep(100);

        if (this.inputElement.value) {
            this.expand();
            this.notifyInputChange();
        }
    }

    private collapse() {
        this.containerElement.classList.add('collapsed');
    }

    private expand() {
        this.containerElement.classList.remove('collapsed');
    }

    private notifyInputChange() {
        const value = '' + this.inputElement.value;
        const filterTerms = this.tabMatcher.getMatchTermsFromString(value);

        this.eventBus.publish(new TabFilterRequested(filterTerms));
    }
}
