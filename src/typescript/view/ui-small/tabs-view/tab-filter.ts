import { QueryBus } from '../../../bus/query-bus';
import { OpenedTab } from '../../../tab/opened-tab/opened-tab';
import { GetOpenedTabIdsThatMatchFilter } from '../../../tab/opened-tab/query/get-opened-tab-ids-that-match-filter';
import { GetOpenedTabs } from '../../../tab/opened-tab/query/get-opened-tabs';
import { sleep } from '../../../utils/sleep';

type TabFilterResultObserver = (matchingTabs: OpenedTab[]) => void;
type TabFilterClearObserver = () => void;

export class TabFilter {
    private filterInputElement: HTMLInputElement;
    private clearInputElement: HTMLElement;
    private filterClearObserverList: TabFilterClearObserver[] = [];
    private filterResultObserverList: TabFilterResultObserver[] = [];
    private previousFilterText: string = '';

    constructor(containerElement: HTMLElement, private queryBus: QueryBus, private filterValueStorageKey?: string) {
        this.filterInputElement = containerElement.querySelector('.filter-input');
        this.clearInputElement = containerElement.querySelector('.clear-icon');

        if (undefined === this.filterValueStorageKey) {
            this.filterValueStorageKey = 'tab-filter';
        }
    }

    public async init() {
        let timeoutReference: number = null;

        this.filterInputElement.addEventListener('input', () => {
            if (timeoutReference) {
                clearTimeout(timeoutReference);
            }

            timeoutReference = setTimeout(this.onFilterInputChange.bind(this), 300);
        });
        this.filterInputElement.addEventListener('change', this.onFilterInputChange.bind(this));

        this.clearInputElement.addEventListener('click', () => {
            this.filterInputElement.value = '';
            this.onFilterInputChange();
        });

        // needed, otherwise the prefilled-text might not be found at browser start
        await sleep(100);

        if (this.filterInputElement.value) {
            this.onFilterInputChange();
        } else {
            await this.setInputValueFromLocalStorage();
        }
    }

    private async onFilterInputChange() {
        const filterText = '' + this.filterInputElement.value;
        this.setLocalStorageFilterText(filterText);

        if (filterText == this.previousFilterText) {
            return;
        }

        this.previousFilterText = filterText;

        if ('' === filterText) {
            this.notifyFilterClear();
            this.clearInputElement.classList.add('hide');

            return;
        }

        // TODO use GetOpenedTabIdsThatMatchFilter
        const matchingTabs = await this.queryBus.query(new GetOpenedTabs({
            filterText,
            matchOnTitle: true,
            matchOnUrl: true,
        }));
        this.notifyFilterResultRetrieved(matchingTabs);
        this.clearInputElement.classList.remove('hide');
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

    private async setInputValueFromLocalStorage() {
        const savedValue = await this.getFilterTextFromLocalStorage();

        if (savedValue) {
            this.filterInputElement.value = savedValue;
            this.onFilterInputChange();
        }
    }

    private async getFilterTextFromLocalStorage() {
        const storageObject = await browser.storage.local.get(this.filterValueStorageKey);

        return storageObject[this.filterValueStorageKey] as string;
    }

    private async setLocalStorageFilterText(filterText: string) {
        const persistObject: any = {};
        persistObject[this.filterValueStorageKey] = filterText;

        await browser.storage.local.set(persistObject);
    }
}

export class TabFilterFactory {
    constructor(private queryBus: QueryBus) {
    }

    create(containerElement: HTMLElement) {
        return new TabFilter(containerElement, this.queryBus);
    }
}
