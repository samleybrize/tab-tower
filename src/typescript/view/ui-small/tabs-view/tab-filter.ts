import { EventBus } from '../../../bus/event-bus';
import { QueryBus } from '../../../bus/query-bus';
import { OpenedTab } from '../../../tab/opened-tab/opened-tab';
import { GetOpenedTabIdsThatMatchFilter } from '../../../tab/opened-tab/query/get-opened-tab-ids-that-match-filter';
import { GetOpenedTabs } from '../../../tab/opened-tab/query/get-opened-tabs';
import { sleep } from '../../../utils/sleep';

type TabFilterResultObserver = (matchingTabs: OpenedTab[]) => void;
type TabFilterClearObserver = () => void;

export class TabFilter {
    private filterInputElement: HTMLInputElement;
    private filterClearObserverList: TabFilterClearObserver[] = [];
    private filterResultObserverList: TabFilterResultObserver[] = [];
    private previousFilterText: string = '';

    constructor(containerElement: HTMLElement, private eventBus: EventBus, private queryBus: QueryBus) {
        this.filterInputElement = containerElement.querySelector('.filter-input');
        this.initInput();
    }

    private async initInput() {
        let timeoutReference: number = null;

        this.filterInputElement.addEventListener('input', (event) => {
            if (timeoutReference) {
                clearTimeout(timeoutReference);
            }

            timeoutReference = setTimeout(this.onFilterInputChange.bind(this), 300);
        });
        this.filterInputElement.addEventListener('change', this.onFilterInputChange.bind(this));

        // needed, otherwise the prefilled-text might not be found at browser start
        await sleep(100);

        if (this.filterInputElement.value) {
            this.onFilterInputChange();
        }
    }

    private async onFilterInputChange() {
        const filterText = '' + this.filterInputElement.value;

        if (filterText == this.previousFilterText) {
            return;
        }

        this.previousFilterText = filterText;

        if ('' === filterText) {
            this.notifyFilterClear();

            return;
        }

        // TODO use GetOpenedTabIdsThatMatchFilter
        const matchingTabs = await this.queryBus.query(new GetOpenedTabs({
            filterText,
            matchOnTitle: true,
            matchOnUrl: true,
        }));
        this.notifyFilterResultRetrieved(matchingTabs);
    }

    private notifyFilterClear() {
        for (const notifyObserver of this.filterClearObserverList) {
            notifyObserver();
        }
    }

    private notifyFilterResultRetrieved(matchingTabs: OpenedTab[]) {
        for (const notifyObserver of this.filterResultObserverList) {
            notifyObserver(matchingTabs);
        }
    }

    async isTabSatisfiesFilter(tabId: string): Promise<boolean> {
        const filterText = '' + this.filterInputElement.value;

        if ('' == filterText) {
            return true;
        }

        const filter = {
            filterText,
            matchOnTitle: true,
            matchOnUrl: true,
        };
        const matchingTabIdList = await this.queryBus.query(new GetOpenedTabIdsThatMatchFilter(filter, [tabId]));

        return matchingTabIdList.length > 0;
    }

    observeFilterClear(observer: TabFilterClearObserver) {
        this.filterClearObserverList.push(observer);
    }

    observeFilterResultRetrieval(observer: TabFilterResultObserver) {
        this.filterResultObserverList.push(observer);
    }
}

export class TabFilterfactory {
    constructor(private eventBus: EventBus, private queryBus: QueryBus) {
    }

    create(containerElement: HTMLElement) {
        return new TabFilter(containerElement, this.eventBus, this.queryBus);
    }
}
