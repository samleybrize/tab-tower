import { sleep } from '../../utils/sleep';

export type TabSelectorNativeCheckboxStateChanged = (checkboxElement: HTMLInputElement, isChecked: boolean) => void;
export type OnTabSelectorClick = (checkboxElement: HTMLInputElement, isChecked: boolean, isThereACheckedTabSelector: boolean) => void;

export class TabSelectorManipulator {
    private lastClicked: HTMLInputElement = null;

    constructor(private root: HTMLElement) {
    }

    create(idPrefix: string, isShiftSelectEnabled: boolean, onNativeCheckboxStateChange: TabSelectorNativeCheckboxStateChanged, onTabSelectorClick: OnTabSelectorClick): HTMLElement {
        const checkboxId = `${idPrefix}-tab-selector`;
        const element = document.createElement('div');
        element.classList.add('tabSelector');
        element.innerHTML = `
            <input type="checkbox" class="filled-in" id="${checkboxId}" />
            <label for="${checkboxId}" />
        `;
        const checkboxElement = element.querySelector('input');
        const checkboxLabelElement = element.querySelector('label');

        if (!isShiftSelectEnabled) {
            checkboxElement.classList.add('noShiftSelect');
        }

        checkboxElement.addEventListener('change', () => {
            if (onNativeCheckboxStateChange) {
                onNativeCheckboxStateChange(checkboxElement, checkboxElement.checked);
            }
        });

        checkboxLabelElement.addEventListener('click', async (event) => {
            await sleep(200);

            if (isShiftSelectEnabled && event.shiftKey && this.lastClicked) {
                const action = checkboxElement.checked ? 'uncheck' : 'check';
                this.checkOrUncheckTabSelectorsFromOneToAnother(action, this.lastClicked, checkboxElement);
            }

            if (onTabSelectorClick) {
                onTabSelectorClick(checkboxElement, checkboxElement.checked, this.isThereACheckedTabSelector());
            }

            if (isShiftSelectEnabled) {
                this.lastClicked = checkboxElement;
            }
        });

        return element;
    }

    private checkOrUncheckTabSelectorsFromOneToAnother(action: 'check'|'uncheck', fromSelector: HTMLInputElement, toSelector: HTMLInputElement) {
        const checkboxList = Array.from<HTMLInputElement>(this.root.querySelectorAll('.tabSelector input'));
        let fromSelectorIndex = checkboxList.indexOf(fromSelector);
        let toSelectorIndex = checkboxList.indexOf(toSelector);

        if (fromSelectorIndex < 0 || toSelectorIndex < 0) {
            console.error('Unable to find tab selectors to act on');

            return;
        } else if (fromSelectorIndex == toSelectorIndex) {
            return;
        } else if (fromSelectorIndex > toSelectorIndex) {
            const tsi = toSelectorIndex;
            toSelectorIndex = fromSelectorIndex;
            fromSelectorIndex = tsi;
        }

        for (let i = fromSelectorIndex; i <= toSelectorIndex; i++) {
            this.checkOrUncheckCheckbox(checkboxList[i], action);
        }
    }

    private checkOrUncheckCheckbox(checkboxElement: HTMLInputElement, action: 'check'|'uncheck') {
        if (checkboxElement.checked && 'uncheck' == action) {
            checkboxElement.click();
        } else if (!checkboxElement.checked && 'check' == action) {
            checkboxElement.click();
        }
    }

    private checkCheckbox(checkboxElement: HTMLInputElement) {
        if (!checkboxElement.checked) {
            checkboxElement.click();
        }
    }

    private uncheckCheckbox(checkboxElement: HTMLInputElement) {
        if (checkboxElement.checked) {
            checkboxElement.click();
        }
    }

    private isThereACheckedTabSelector() {
        return null != this.root.querySelector('.tabSelector input:checked:not(.noShiftSelect)');
    }

    check(container: HTMLElement) {
        const checkboxElement: HTMLInputElement = container.querySelector('.tabSelector input');
        this.checkCheckbox(checkboxElement);
    }

    uncheck(container: HTMLElement) {
        const checkboxElement: HTMLInputElement = container.querySelector('.tabSelector input');
        this.uncheckCheckbox(checkboxElement);
    }

    checkAll() {
        const checkboxList = Array.from<HTMLInputElement>(this.root.querySelectorAll('.tabSelector input:not(:checked)'));

        for (const checkboxElement of checkboxList) {
            this.checkCheckbox(checkboxElement);
        }
    }

    uncheckAll() {
        const checkboxList = Array.from<HTMLInputElement>(this.root.querySelectorAll('.tabSelector input:checked'));

        for (const checkboxElement of checkboxList) {
            this.uncheckCheckbox(checkboxElement);
        }
    }

    getCheckedElements() {
        return Array.from<HTMLInputElement>(this.root.querySelectorAll('.tabSelector input:checked'));
    }
}
