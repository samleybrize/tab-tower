import * as moment from 'moment';

import { IndicatorManipulator, IndicatorType } from './component/indicator-manipulator';
import { MoreActionType, MoreMenu, MoreMenuManipulator } from './component/more-menu-manipulator';
import { TabFilterApplier } from './component/tab-filter-applier';
import { MoveAboveOthersClickCallback, MoveBelowClickCallback, TabMoveAction } from './component/tab-move-action';
import { OnTabSelectorClick, TabSelectorManipulator, TabSelectorNativeCheckboxStateChanged } from './component/tab-selector-manipulator';
import { TabTitleClickCallback, TabTitleManipulator } from './component/tab-title-manipulator';

interface TabRow {
    row: HTMLElement;
    titleCell: HTMLElement;
    onOffIndicatorsCell: HTMLElement;
    lastAccessCell: HTMLElement;
    actionsCell: HTMLElement;
}

export class TabView {
    readonly tbodyElement: HTMLElement;
    readonly theadElement: HTMLElement;
    readonly noTabRow: HTMLElement;
    private pendingTasks: Array<() => void> = [];
    private isInitialized = false;

    constructor(
        private indicatorManipulator: IndicatorManipulator,
        private moreMenuManipulator: MoreMenuManipulator,
        private tabFilterApplier: TabFilterApplier,
        private tabMoveAction: TabMoveAction,
        private tabSelectorManipulator: TabSelectorManipulator,
        private tabTitleManipulator: TabTitleManipulator,
        public readonly containerElement: HTMLElement,
    ) {
        if (null == containerElement) {
            throw new Error('null container element received');
        }

        const tableElement = this.createTable(containerElement);
        containerElement.appendChild(tableElement);

        this.tbodyElement = tableElement.querySelector('tbody');
        this.theadElement = tableElement.querySelector('thead');

        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);
    }

    async markAsInitialized() {
        this.isInitialized = true;
        await this.playPendingTasks();
    }

    init(moreMenu: MoreMenu, moveAboveOthersCallback: MoveAboveOthersClickCallback) {
        const idsPrefix = 'general-' + ('' + Math.random()).substr(2);

        const headRow = this.theadElement.querySelector('tr');
        const moveAboveOthersButton = this.tabMoveAction.createMoveAboveOthersButton(moveAboveOthersCallback);
        this.theadElement.querySelector('.indicators').appendChild(moveAboveOthersButton);

        const generalSelectorCell = this.createGeneralSelectorCell(idsPrefix);
        const generalSelectorOldCell = headRow.querySelector('th:nth-child(1)');
        headRow.replaceChild(generalSelectorCell, generalSelectorOldCell);

        const selectionMoreMenuElement = this.moreMenuManipulator.create(moreMenu, idsPrefix, 'Actions on selected tabs', true);
        this.theadElement.querySelector('.actions').appendChild(selectionMoreMenuElement);
        this.moreMenuManipulator.initMoreDropdown(this.theadElement);

        this.tabFilterApplier.init(
            () => this.isInitialized,
            () => {
                this.showNoTabRowIfTableIsEmpty();
            },
        );
    }

    private createTable(containerElement: HTMLElement): HTMLTableElement {
        const table = document.createElement('table');
        table.classList.add('bordered');
        table.classList.add('highlight');
        table.innerHTML = `
            <thead>
                <tr>
                    <th></th>
                    <th>Title</th>
                    <th class="indicators"></th>
                    <th class="lastAccess">Last access</th>
                    <th class="actions"></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        return table;
    }

    show() {
        this.containerElement.classList.add('show');
    }

    hide() {
        this.containerElement.classList.remove('show');
    }

    hideNoTabRow() {
        this.noTabRow.classList.add('transparent');
    }

    showNoTabRowIfTableIsEmpty() {
        if (this.tbodyElement.querySelectorAll('tr:not(.filtered):not(.noTabRow)').length <= 0) {
            this.noTabRow.classList.remove('transparent');
        } else {
            this.noTabRow.classList.add('transparent');
        }
    }

    createNoTabRow() {
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '5');
        cell.textContent = 'No tab found';

        const row = document.createElement('tr');
        row.classList.add('transparent');
        row.classList.add('noTabRow');
        row.appendChild(cell);

        return row;
    }

    createTabRow(
        idsPrefix: string,
        title: string,
        url: string,
        faviconUrl: string,
        isAudible: boolean,
        isInReaderMode: boolean,
        isAudioMuted: boolean,
        isPinned: boolean,
        isIncognito: boolean,
        lastAccess: Date,
        indicatorList: HTMLElement[],
        moreMenu: MoreMenu,
        titleClickCallback: TabTitleClickCallback,
        moveBelowCallback: MoveBelowClickCallback,
    ): TabRow {
        const row = document.createElement('tr');
        row.classList.add('filtrable');

        const selectCell = this.createTabSelectorCell(row, idsPrefix);
        const titleCell = this.createTitleCell(titleClickCallback);
        const onOffIndicatorsCell = this.createIndicatorsCell(indicatorList, moveBelowCallback);
        const lastAccessCell = this.createCell('lastAccess');
        const actionsCell = this.createActionsCell(moreMenu, idsPrefix);

        row.appendChild(selectCell);
        row.appendChild(titleCell);
        row.appendChild(onOffIndicatorsCell);
        row.appendChild(lastAccessCell);
        row.appendChild(actionsCell);

        this.tabTitleManipulator.updateFavicon(row, faviconUrl);
        this.tabTitleManipulator.updateTitle(row, title);
        this.tabTitleManipulator.updateUrl(row, url);
        this.updateTabAudibleIndicator(row, isAudible);
        this.updateTabLastAccess(row, lastAccess);
        this.updateTabIncognitoState(row, isIncognito);
        this.updateTabReaderModeState(row, isInReaderMode);
        this.updateTabAudioMuteState(row, isAudioMuted);
        this.updateTabPinState(row, isPinned);

        return {
            row,
            titleCell,
            onOffIndicatorsCell,
            lastAccessCell,
            actionsCell,
        };
    }

    createCell(className: string): HTMLElement {
        const cell = document.createElement('td');

        if (className) {
            cell.classList.add(className);
        }

        return cell;
    }

    createTabSelectorCell(row: HTMLElement, idsPrefix: string): HTMLElement {
        const onCheckboxStateChange: TabSelectorNativeCheckboxStateChanged = (checkboxElement, isChecked) => {
            if (isChecked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        };
        const onSelectorLabelClick: OnTabSelectorClick = async (checkboxElement, isChecked, isThereACheckedTabSelector) => {
            if (isChecked) {
                this.showSelectionActions();
            } else if (!isThereACheckedTabSelector) {
                this.hideSelectionActions();
                this.uncheckGeneralTabSelector();
            }
        };
        const tabSelector = this.tabSelectorManipulator.create(idsPrefix, true, onCheckboxStateChange, onSelectorLabelClick);
        const beingMovedIndicator = this.tabMoveAction.createBeingMovedIndicator();

        const cell = document.createElement('td');
        cell.appendChild(tabSelector);
        cell.appendChild(beingMovedIndicator);

        return cell;
    }

    createGeneralSelectorCell(idsPrefix: string): HTMLElement {
        const onCheckboxStateChange: TabSelectorNativeCheckboxStateChanged = (checkboxElement, isChecked) => {
            if (isChecked) {
                this.tabSelectorManipulator.checkAll();
            } else {
                this.tabSelectorManipulator.uncheckAll();
            }
        };
        const onSelectorLabelClick: OnTabSelectorClick = async (checkboxElement, isChecked, isThereACheckedTabSelector) => {
            if (isChecked) {
                this.showSelectionActions();
            } else {
                this.hideSelectionActions();
            }
        };
        const generalTabSelector = this.tabSelectorManipulator.create(idsPrefix, false, onCheckboxStateChange, onSelectorLabelClick);
        const moveCancelButton = this.tabMoveAction.createCancelButton();

        const cell = document.createElement('th');
        cell.appendChild(generalTabSelector);
        cell.appendChild(moveCancelButton);

        return cell;
    }

    private uncheckGeneralTabSelector() {
        this.tabSelectorManipulator.uncheck(this.theadElement);
    }

    private showSelectionActions() {
        this.moreMenuManipulator.showMoreButton(this.theadElement);
    }

    private hideSelectionActions() {
        this.moreMenuManipulator.hideMoreButton(this.theadElement);
    }

    showOrHideSelectionActionsDependingOfSelectedTabs() {
        if (this.tabSelectorManipulator.isThereACheckedTabSelector()) {
            this.showSelectionActions();
        } else {
            this.hideSelectionActions();
        }
    }

    createTitleCell(clickListener: TabTitleClickCallback): HTMLElement {
        const titleElement = this.tabTitleManipulator.create(clickListener);

        const cell = document.createElement('td');
        cell.appendChild(titleElement);

        return cell;
    }

    createIndicatorsCell(indicatorList: HTMLElement[], moveBelowHandler: MoveBelowClickCallback): HTMLElement {
        const moveBelowButton = this.tabMoveAction.createMoveBelowButton(moveBelowHandler);

        const cell = this.createCell('indicators');
        cell.appendChild(moveBelowButton);

        for (const indicatorElement of indicatorList) {
            cell.appendChild(indicatorElement);
        }

        return cell;
    }

    createActionsCell(moreMenu: MoreMenu, idsPrefix: string, tooltipText?: string): HTMLElement {
        tooltipText = tooltipText ? tooltipText : 'Actions';
        const moreMenuElement = this.moreMenuManipulator.create(moreMenu, idsPrefix, tooltipText, false);

        const cell = this.createCell('actions');
        cell.appendChild(moreMenuElement);

        return cell;
    }

    moveTabAction(clickedElement: HTMLAnchorElement) {
        const row = clickedElement.closest('tr') as HTMLElement;
        this.tabMoveAction.enableMoveMode([row]);
    }

    moveSelectedTabsAction() {
        const checkedList = this.tabSelectorManipulator.getCheckedElements();
        const selectedRows: HTMLElement[] = [];

        for (const checkboxElement of checkedList) {
            const row = checkboxElement.closest('tr') as HTMLElement;
            selectedRows.push(row);
        }

        if (0 == selectedRows.length) {
            return;
        }

        this.tabMoveAction.enableMoveMode(selectedRows);
    }

    triggerTabActionOnSelectedRows(actionType: MoreActionType) {
        const checkedList = this.tabSelectorManipulator.getCheckedElements();

        for (const checkboxElement of checkedList) {
            const row = checkboxElement.closest('tr') as HTMLElement;
            this.moreMenuManipulator.triggerAction(row, actionType);
        }
    }

    updateTabLastAccess(row: HTMLElement, lastAccess: Date) {
        if (lastAccess) {
            row.querySelector('.lastAccess').innerHTML = moment(lastAccess).format('LLL');
        }
    }

    updateTabAudibleIndicator(row: HTMLElement, isOn: boolean) {
        this.indicatorManipulator.changeState(row, IndicatorType.Audible, isOn);
    }

    updateTabAudioMuteState(row: HTMLElement, isAudioMuted: boolean) {
        this.indicatorManipulator.changeState(row, IndicatorType.Muted, isAudioMuted);

        if (isAudioMuted) {
            this.moreMenuManipulator.hideAction(row, MoreActionType.Mute);
            this.moreMenuManipulator.showAction(row, MoreActionType.Unmute);
        } else {
            this.moreMenuManipulator.showAction(row, MoreActionType.Mute);
            this.moreMenuManipulator.hideAction(row, MoreActionType.Unmute);
        }
    }

    updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        this.indicatorManipulator.changeState(row, IndicatorType.ReaderView, isInReaderMode);
    }

    updateTabPinState(row: HTMLElement, isPinned: boolean) {
        this.indicatorManipulator.changeState(row, IndicatorType.Pinned, isPinned);

        if (isPinned) {
            this.moreMenuManipulator.hideAction(row, MoreActionType.Pin);
            this.moreMenuManipulator.showAction(row, MoreActionType.Unpin);
        } else {
            this.moreMenuManipulator.showAction(row, MoreActionType.Pin);
            this.moreMenuManipulator.hideAction(row, MoreActionType.Unpin);
        }
    }

    updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        this.indicatorManipulator.changeState(row, IndicatorType.Incognito, isIncognito);
    }

    addPendingTask(task: () => void) {
        if (this.isTaskHandlingNotReady()) {
            this.pendingTasks.push(task);
            return;
        }

        task();
    }

    private isTaskHandlingNotReady() {
        return !this.isInitialized || this.pendingTasks.length;
    }

    async playPendingTasks() {
        while (this.pendingTasks.length) {
            const callback = this.pendingTasks.shift();
            await callback();
        }

        this.pendingTasks = [];
    }
}
