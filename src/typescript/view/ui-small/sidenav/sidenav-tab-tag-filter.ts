import { EventBus } from '../../../bus/event-bus';
import { QueryBus } from '../../../bus/query-bus';
import { GetTabTagIdsThatMatchFilter } from '../../../tab/tab-tag/query';
import { sleep } from '../../../utils/sleep';

type TabTagFilterResultObserver = (matchingTagIds: string[]) => void;
type TabTagFilterClearObserver = () => void;

export class SidenavTabTagFilter {
    private filterInputElement: HTMLInputElement;
    private filterClearObserverList: TabTagFilterClearObserver[] = [];
    private filterResultObserverList: TabTagFilterResultObserver[] = [];
    private previousFilterText: string = '';

    constructor(containerElement: HTMLElement, private queryBus: QueryBus) {
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

        const matchingTabs = await this.queryBus.query(new GetTabTagIdsThatMatchFilter({filterText}));
        this.notifyFilterResultRetrieved(matchingTabs);
    }

    private notifyFilterClear() {
        for (const notifyObserver of this.filterClearObserverList) {
            notifyObserver();
        }
    }

    private notifyFilterResultRetrieved(matchingTagIds: string[]) {
        for (const notifyObserver of this.filterResultObserverList) {
            notifyObserver(matchingTagIds);
        }
    }

    async isTabTagSatisfiesFilter(tagId: string): Promise<boolean> {
        const filterText = '' + this.filterInputElement.value;

        if ('' == filterText) {
            return true;
        }

        const filter = {filterText};
        const matchingTagIdList = await this.queryBus.query(new GetTabTagIdsThatMatchFilter(filter, [tagId]));

        return matchingTagIdList.length > 0;
    }

    observeFilterClear(observer: TabTagFilterClearObserver) {
        this.filterClearObserverList.push(observer);
    }

    observeFilterResultRetrieval(observer: TabTagFilterResultObserver) {
        this.filterResultObserverList.push(observer);
    }
}

export class SidenavTabTagFilterFactory {
    constructor(private queryBus: QueryBus) {
    }

    create(containerElement: HTMLElement) {
        return new SidenavTabTagFilter(containerElement, this.queryBus);
    }
}
