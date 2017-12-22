import { EventBus } from '../bus/event-bus';
import { TabFilterRequested } from '../tab/event/tab-filter-requested';

export class TabFilterView {
    constructor(private eventBus: EventBus, private inputElement: HTMLInputElement) {
        if (null == inputElement) {
            throw new Error('null input element received');
        } else if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('input element must be an instance of HTMLInputElement');
        }
    }

    init() {
        let timeoutReference: number = null;
        this.inputElement.addEventListener('input', (event) => {
            if (timeoutReference) {
                clearTimeout(timeoutReference);
            }

            timeoutReference = setTimeout(this.notifyInputChange.bind(this), 300);
        });

        if (this.inputElement.value) {
            this.notifyInputChange();
        }
    }

    private notifyInputChange() {
        const value = '' + this.inputElement.value;
        const filterTerms = value.toLowerCase().split(' ');

        this.eventBus.publish(new TabFilterRequested(filterTerms));
    }
}
