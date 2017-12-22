import { EventBus } from '../bus/event-bus';
import { TabSearched } from '../tab/event/tab-searched';

export class TabSearchView {
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
            // TODO
            this.notifyInputChange();
        }
    }

    private notifyInputChange() {
        const value = '' + this.inputElement.value;
        const searchTerms = value.toLowerCase().split(' ');

        this.eventBus.publish(new TabSearched(searchTerms));
    }
}
