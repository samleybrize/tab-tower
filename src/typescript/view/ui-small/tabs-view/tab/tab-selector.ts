export type TabSelectStateChangeObserver = (openedTabId: string, isSelected: boolean) => void;
export type TabSelectorShiftClickObserver = (openedTabId: string) => void;

export class TabSelector {
    private checkboxElement: HTMLInputElement;
    private selected = false;
    private selectStateChangeObserverList: TabSelectStateChangeObserver[] = [];
    private shiftClickObserverList: TabSelectorShiftClickObserver[] = [];

    constructor(private tabElement: HTMLElement, tabSelectorContainer: HTMLElement, private openedTabId: string) {
        this.checkboxElement = tabSelectorContainer.querySelector('input') as HTMLInputElement;

        this.checkboxElement.addEventListener('change', () => {
            if (this.checkboxElement.checked) {
                this.markAsSelected();
            } else {
                this.markAsUnselected();
            }

            this.notifySelectStateChange(this.selected);
        });
        tabSelectorContainer.addEventListener('click', async (event: MouseEvent) => {
            if (event.shiftKey) {
                this.toggleSelected();
                this.notifyShiftClick();
            }
        });
    }

    private notifySelectStateChange(isSelected: boolean) {
        for (const observer of this.selectStateChangeObserverList) {
            observer(this.openedTabId, isSelected);
        }
    }

    private notifyShiftClick() {
        for (const observer of this.shiftClickObserverList) {
            observer(this.openedTabId);
        }
    }

    isSelected() {
        return this.selected;
    }

    markAsSelected() {
        this.tabElement.classList.add('selected');
        this.checkboxElement.setAttribute('checked', 'checked');
        this.checkboxElement.checked = true;
        this.selected = true;
    }

    markAsUnselected() {
        this.tabElement.classList.remove('selected');
        this.checkboxElement.removeAttribute('checked');
        this.checkboxElement.checked = false;
        this.selected = false;
    }

    toggleSelected() {
        if (this.checkboxElement.checked) {
            this.markAsUnselected();
        } else {
            this.markAsSelected();
        }
    }

    observeSelectStateChange(observer: TabSelectStateChangeObserver) {
        this.selectStateChangeObserverList.push(observer);
    }

    observeShiftClick(observer: TabSelectorShiftClickObserver) {
        this.shiftClickObserverList.push(observer);
    }
}
