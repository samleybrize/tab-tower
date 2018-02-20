import * as moment from 'moment';

import { sleep } from '../utils/sleep';
import { StringMatcher } from '../utils/string-matcher';

type HtmlClickListener = (this: HTMLAnchorElement, ev: HTMLElementEventMap['click']) => any;
type TabTitleClickCallback = (row: HTMLElement) => void;

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
    readonly titleActionsCell: HTMLElement;
    readonly noTabRow: HTMLElement;
    private filterTerms: string[] = null;
    private pendingTasks: Array<() => void> = [];
    isInitialized = false;

    constructor(
        private stringMatcher: StringMatcher,
        private containerElement: HTMLElement,
        private defaultFaviconUrl: string,
    ) {
        if (null == containerElement) {
            throw new Error('null container element received');
        }

        const tableElement = this.createTable(containerElement);
        containerElement.appendChild(tableElement);
        this.tbodyElement = tableElement.querySelector('tbody');
        this.theadElement = tableElement.querySelector('thead');
        this.titleActionsCell = this.theadElement.querySelector('.actions');
        this.initActionsDropdown(this.theadElement.querySelector('tr:nth-child(1)'));

        this.noTabRow = this.createNoTabRow();
        this.tbodyElement.appendChild(this.noTabRow);
    }

    private createTable(containerElement: HTMLElement): HTMLTableElement {
        const idsPrefix = 'all-rows-selector-' + ('' + Math.random()).substr(2);
        const actionsCell = this.createActionsCell(idsPrefix, 'Actions on selected tabs');

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
                    <th class="actions">${actionsCell.innerHTML}</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const titleCheckboxCell = this.createTitleCheckboxCell(idsPrefix);
        const titleCheckboxRow = table.querySelector('thead tr:nth-child(1)');
        const titleCheckboxOldCell = titleCheckboxRow.querySelector('th:nth-child(1)');
        titleCheckboxRow.replaceChild(titleCheckboxCell, titleCheckboxOldCell);

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
        lastAccess: Date,
        clickListener: TabTitleClickCallback,
    ): TabRow {
        const row = document.createElement('tr');

        const selectCell = this.createCheckboxCell(row, idsPrefix);
        const titleCell = this.createTitleCell((event) => clickListener(row));
        const onOffIndicatorsCell = this.createCell('indicators');
        const lastAccessCell = this.createCell('lastAccess');
        const actionsCell = this.createActionsCell(idsPrefix);
        this.addAudibleIndicator(onOffIndicatorsCell);

        row.appendChild(selectCell);
        row.appendChild(titleCell);
        row.appendChild(onOffIndicatorsCell);
        row.appendChild(lastAccessCell);
        row.appendChild(actionsCell);

        this.updateTabFavicon(row, faviconUrl);
        this.updateTabAudibleIndicator(row, isAudible);
        this.updateTabTitle(row, title);
        this.updateTabUrl(row, url);
        this.updateTabLastAccess(row, lastAccess);

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

    createCheckboxCell(row: HTMLElement, idsPrefix: string): HTMLElement {
        const checkboxId = `${idsPrefix}-selector`;
        const cell = this.createCell('tabSelector');
        cell.innerHTML = `
            <input type="checkbox" class="filled-in" id="${checkboxId}" />
            <label for="${checkboxId}" />
        `;

        const checkboxElement = cell.querySelector('input');
        checkboxElement.addEventListener('change', async () => {
            if (checkboxElement.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });

        const checkboxLabelElement = cell.querySelector('label');
        checkboxLabelElement.addEventListener('click', async () => {
            await sleep(200);

            if (checkboxElement.checked) {
                this.showTitleActions();
            } else if (!this.isThereACheckedTabSelector()) {
                this.hideTitleActions();
                this.uncheckTitleTabSelector();
            }
        });

        return cell;
    }

    private isThereACheckedTabSelector() {
        return null != this.tbodyElement.querySelector('.tabSelector input:checked');
    }

    createTitleCheckboxCell(idsPrefix: string): HTMLElement {
        const cell = document.createElement('th');
        cell.classList.add('titleTabSelector');
        cell.innerHTML = `
            <input type="checkbox" class="filled-in" id="${idsPrefix}" />
            <label for="${idsPrefix}" />
        `;

        const checkboxElement = cell.querySelector('input');
        checkboxElement.addEventListener('change', () => {
            if (checkboxElement.checked) {
                this.checkAllTabSelectors();
            } else {
                this.uncheckAllTabSelectors();
            }
        });

        const checkboxLabelElement = cell.querySelector('label');
        checkboxLabelElement.addEventListener('click', async () => {
            await sleep(200);

            if (checkboxElement.checked) {
                this.showTitleActions();
            } else {
                this.hideTitleActions();
            }
        });

        return cell;
    }

    private uncheckTitleTabSelector() {
        const titleTabSelector: HTMLInputElement = this.theadElement.querySelector('.titleTabSelector input');
        titleTabSelector.checked = false;
    }

    private checkAllTabSelectors() {
        const tabSelectorList: HTMLInputElement[] = Array.from(this.tbodyElement.querySelectorAll('.tabSelector input'));

        for (const tabSelector of tabSelectorList) {
            // setting tabSelector.checked to true does not fire the "change" event
            if (!tabSelector.checked) {
                tabSelector.click();
            }
        }
    }

    private uncheckAllTabSelectors() {
        const tabSelectorList: HTMLInputElement[] = Array.from(this.tbodyElement.querySelectorAll('.tabSelector input'));

        for (const tabSelector of tabSelectorList) {
            // setting tabSelector.checked to false does not fire the "change" event
            if (tabSelector.checked) {
                tabSelector.click();
            }
        }
    }

    private showTitleActions() {
        const moreButton = this.theadElement.querySelector('.more');

        if (!moreButton.classList.contains('show')) {
            moreButton.classList.add('show');
            jQuery(moreButton).tooltip();
        }
    }

    private hideTitleActions() {
        this.theadElement.querySelector('.more').classList.remove('show');
    }

    createTitleCell(clickListener: HtmlClickListener): HTMLElement {
        const linkElement = document.createElement('a');
        linkElement.innerHTML = `
            <img crossorigin="anonymous" />
            <span></span>
            <em></em>
        `;
        linkElement.addEventListener('click', clickListener);
        linkElement.querySelector('img').addEventListener('error', (event) => {
            (event.target as HTMLImageElement).src = this.defaultFaviconUrl;
        });

        const cell = this.createCell('title');
        cell.appendChild(linkElement);

        return cell;
    }

    addOnOffIndicator(cell: HTMLElement, className: string, label: string) {
        const badgeElement = document.createElement('span');
        badgeElement.classList.add(className);
        badgeElement.classList.add('badge');
        badgeElement.innerHTML = `<i class="material-icons"></i> <span>${label}</span>`;

        cell.appendChild(badgeElement);
    }

    addMuteIndicator(cell: HTMLElement) {
        this.addOnOffIndicator(cell, 'muteIndicator', 'muted');
    }

    addPinIndicator(cell: HTMLElement) {
        this.addOnOffIndicator(cell, 'pinIndicator', 'pinned');
    }

    addReaderModeIndicator(cell: HTMLElement) {
        this.addOnOffIndicator(cell, 'readerModeIndicator', 'reader view');
    }

    addIncognitoIndicator(cell: HTMLElement) {
        this.addOnOffIndicator(cell, 'incognitoIndicator', 'incognito');
    }

    addAudibleIndicator(cell: HTMLElement) {
        const iconElement = document.createElement('span');
        iconElement.classList.add('audibleIndicator');
        iconElement.innerHTML = `<i class="material-icons">volume_up</i>`;

        cell.appendChild(iconElement);
    }

    createActionsCell(idsPrefix: string, tooltipText?: string): HTMLElement {
        const dropdownId = `${idsPrefix}-action`;
        const moreButton = document.createElement('a');
        moreButton.classList.add('more');
        moreButton.classList.add('waves-effect');
        moreButton.classList.add('waves-teal');
        moreButton.classList.add('btn-flat');
        moreButton.setAttribute('data-activates', dropdownId);
        moreButton.setAttribute('href', '#');
        moreButton.setAttribute('data-tooltip', tooltipText ? tooltipText : 'Actions');
        moreButton.innerHTML = '<i class="material-icons">more_vert</i>';
        jQuery(moreButton).tooltip();

        const cell = this.createCell('actions');
        cell.appendChild(moreButton);

        const dropdownContainer = document.createElement('div');
        dropdownContainer.innerHTML = `<ul id='${dropdownId}' class='dropdown-content tabRowDropdown'></ul>`;
        const dropdownElement = dropdownContainer.querySelector('.tabRowDropdown') as HTMLElement;
        cell.appendChild(dropdownElement);

        return cell;
    }

    addAction(cell: HTMLElement, label: string, cssClass: string, iconName: string, isDangerous: boolean, clickListener: HtmlClickListener) {
        const containerElement = document.createElement('li');
        containerElement.classList.add(cssClass);
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">${iconName}</i> ${label}</a>`;
        const button = containerElement.querySelector('a');

        if (isDangerous) {
            containerElement.classList.add('warning');
        }

        button.addEventListener('click', clickListener);

        cell.querySelector('.tabRowDropdown').appendChild(containerElement);
    }

    addActionSeparator(dropdownElement: HTMLElement) {
        const separatorElement = document.createElement('li');
        separatorElement.classList.add('divider');

        dropdownElement.querySelector('.tabRowDropdown').appendChild(separatorElement);
    }

    initActionsDropdown(row: HTMLElement) {
        const moreButton = row.querySelector('.more');
        jQuery(moreButton).dropdown({constrainWidth: false});
    }

    addFollowTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Follow', 'followButton', 'settings_backup_restore', false, clickListener);
    }

    private clickButtonOnSelectedRows(buttonCssClass: string) {
        const checkedList = Array.from(this.tbodyElement.querySelectorAll('.tabSelector input:checked'));

        for (const checkboxElement of checkedList) {
            const button: HTMLElement = checkboxElement.closest('tr').querySelector(`.${buttonCssClass} a`);
            button.click();
        }
    }

    addFollowSelectedTabsAction(cell: HTMLElement) {
        this.addFollowTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'followButton'));
    }

    addUnfollowTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Unfollow', 'unfollowButton', 'not_interested', true, clickListener);
    }

    addUnfollowSelectedTabsAction(cell: HTMLElement) {
        this.addUnfollowTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'unfollowButton'));
    }

    addPinTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Pin', 'pinButton', 'stars', false, clickListener);
    }

    addPinSelectedTabsAction(cell: HTMLElement) {
        this.addPinTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'pinButton'));
    }

    addUnpinTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Unpin', 'unpinButton', 'stars', false, clickListener);
    }

    addUnpinSelectedTabsAction(cell: HTMLElement) {
        this.addUnpinTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'unpinButton'));
    }

    addMuteTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Mute', 'muteButton', 'volume_off', false, clickListener);
    }

    addMuteSelectedTabsAction(cell: HTMLElement) {
        this.addMuteTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'muteButton'));
    }

    addUnmuteTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Unmute', 'unmuteButton', 'volume_up', false, clickListener);
    }

    addUnmuteSelectedTabsAction(cell: HTMLElement) {
        this.addUnmuteTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'unmuteButton'));
    }

    addDuplicateTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Duplicate', 'duplicateButton', 'content_copy', false, clickListener);
    }

    addDuplicateSelectedTabsAction(cell: HTMLElement) {
        this.addDuplicateTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'duplicateButton'));
    }

    addReloadTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Reload', 'reloadButton', 'autorenew', false, clickListener);
    }

    addReloadSelectedTabsAction(cell: HTMLElement) {
        this.addReloadTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'reloadButton'));
    }

    addCloseTabAction(cell: HTMLElement, clickListener: HtmlClickListener) {
        this.addAction(cell, 'Close', 'closeButton', 'close', true, clickListener);
    }

    addCloseSelectedTabsAction(cell: HTMLElement) {
        this.addCloseTabAction(cell, this.clickButtonOnSelectedRows.bind(this, 'closeButton'));
    }

    showFollowButton(row: HTMLElement) {
        row.querySelector('.followButton').classList.remove('transparent');
    }

    hideFollowButton(row: HTMLElement) {
        row.querySelector('.followButton').classList.add('transparent');
    }

    enableFollowButton(row: HTMLElement) {
        row.querySelector('.followButton').classList.remove('disabled');
    }

    disableFollowButton(row: HTMLElement) {
        row.querySelector('.followButton').classList.add('disabled');
    }

    isFollowButtonDisabled(row: HTMLElement) {
        return row.querySelector('.followButton').classList.contains('disabled');
    }

    showUnfollowButton(row: HTMLElement) {
        row.querySelector('.unfollowButton').classList.remove('transparent');
    }

    hideUnfollowButton(row: HTMLElement) {
        row.querySelector('.unfollowButton').classList.add('transparent');
    }

    enableUnfollowButton(row: HTMLElement) {
        row.querySelector('.unfollowButton').classList.remove('disabled');
    }

    disableUnfollowButton(row: HTMLElement) {
        row.querySelector('.unfollowButton').classList.add('disabled');
    }

    isUnfollowButtonDisabled(row: HTMLElement) {
        return row.querySelector('.unfollowButton').classList.contains('disabled');
    }

    showCloseButton(row: HTMLElement) {
        row.querySelector('.closeButton').classList.remove('transparent');
    }

    hideCloseButton(row: HTMLElement) {
        row.querySelector('.closeButton').classList.add('transparent');
    }

    enableCloseButton(row: HTMLElement) {
        row.querySelector('.closeButton').classList.remove('disabled');
    }

    disableCloseButton(row: HTMLElement) {
        row.querySelector('.closeButton').classList.add('disabled');
    }

    isCloseButtonDisabled(row: HTMLElement) {
        return row.querySelector('.closeButton').classList.contains('disabled');
    }

    enableDuplicateButton(row: HTMLElement) {
        row.querySelector('.duplicateButton').classList.remove('disabled');
    }

    disableDuplicateButton(row: HTMLElement) {
        row.querySelector('.duplicateButton').classList.add('disabled');
    }

    enableReloadButton(row: HTMLElement) {
        row.querySelector('.reloadButton').classList.remove('disabled');
    }

    disableReloadButton(row: HTMLElement) {
        row.querySelector('.reloadButton').classList.add('disabled');
    }

    enablePinButton(row: HTMLElement) {
        row.querySelector('.pinButton').classList.remove('disabled');
    }

    disablePinButton(row: HTMLElement) {
        row.querySelector('.pinButton').classList.add('disabled');
    }

    showPinButton(row: HTMLElement) {
        row.querySelector('.pinButton').classList.remove('transparent');
    }

    hidePinButton(row: HTMLElement) {
        row.querySelector('.pinButton').classList.add('transparent');
    }

    showUnpinButton(row: HTMLElement) {
        row.querySelector('.unpinButton').classList.remove('transparent');
    }

    hideUnpinButton(row: HTMLElement) {
        row.querySelector('.unpinButton').classList.add('transparent');
    }

    enableMuteButton(row: HTMLElement) {
        row.querySelector('.muteButton').classList.remove('disabled');
    }

    disableMuteButton(row: HTMLElement) {
        row.querySelector('.muteButton').classList.add('disabled');
    }

    showMuteButton(row: HTMLElement) {
        row.querySelector('.muteButton').classList.remove('transparent');
    }

    hideMuteButton(row: HTMLElement) {
        row.querySelector('.muteButton').classList.add('transparent');
    }

    enableUnmuteButton(row: HTMLElement) {
        row.querySelector('.unmuteButton').classList.remove('disabled');
    }

    disableUnmuteButton(row: HTMLElement) {
        row.querySelector('.unmuteButton').classList.add('disabled');
    }

    showUnmuteButton(row: HTMLElement) {
        row.querySelector('.unmuteButton').classList.remove('transparent');
    }

    hideUnmuteButton(row: HTMLElement) {
        row.querySelector('.unmuteButton').classList.add('transparent');
    }

    updateTabTitle(row: HTMLElement, title: string) {
        row.querySelector('.title a span').textContent = title;
    }

    updateTabTitleTooltip(row: HTMLElement, text: string) {
        const titleCell = row.querySelector('.title');
        titleCell.setAttribute('data-tooltip', text);
        jQuery(titleCell).tooltip();
    }

    updateTabFavicon(row: HTMLElement, faviconUrl: string) {
        const faviconElement = row.querySelector('.title a img') as HTMLImageElement;

        if (null == faviconUrl) {
            faviconElement.src = this.defaultFaviconUrl;
        } else {
            faviconElement.src = faviconUrl;
        }
    }

    updateTabUrl(row: HTMLElement, url: string) {
        row.setAttribute('data-url', '' + url);
        row.querySelector('.title a').setAttribute('data-url', '' + url);
        row.querySelector('.title em').textContent = url;
    }

    updateTabLastAccess(row: HTMLElement, lastAccess: Date) {
        if (lastAccess) {
            row.querySelector('.lastAccess').innerHTML = moment(lastAccess).format('LLL');
        }
    }

    updateOnOffIndicator(row: HTMLElement, className: string, isOn: boolean) {
        const indicatorElement = row.querySelector(`.${className}`);

        if (isOn) {
            indicatorElement.classList.remove('off');
            indicatorElement.classList.add('on');
            indicatorElement.querySelector('.material-icons').textContent = 'check_circle';
        } else {
            indicatorElement.classList.add('off');
            indicatorElement.classList.remove('on');
            indicatorElement.querySelector('.material-icons').textContent = 'cancel';
        }
    }

    updateTabAudibleIndicator(row: HTMLElement, isOn: boolean) {
        const indicatorElement = row.querySelector(`.audibleIndicator`);

        if (isOn) {
            indicatorElement.classList.remove('off');
            indicatorElement.classList.add('on');
            indicatorElement.setAttribute('data-tooltip', 'Produces sound');
            jQuery(indicatorElement).tooltip();
        } else {
            indicatorElement.classList.add('off');
            indicatorElement.classList.remove('on');
            jQuery(indicatorElement).tooltip('remove');
        }
    }

    updateTabAudioMuteState(row: HTMLElement, isAudioMuted: boolean) {
        this.updateOnOffIndicator(row, 'muteIndicator', isAudioMuted);

        if (isAudioMuted) {
            this.hideMuteButton(row);
            this.showUnmuteButton(row);
        } else {
            this.showMuteButton(row);
            this.hideUnmuteButton(row);
        }
    }

    updateTabReaderModeState(row: HTMLElement, isInReaderMode: boolean) {
        row.setAttribute('data-reader-mode', isInReaderMode ? '1' : '');

        this.updateOnOffIndicator(row, 'readerModeIndicator', isInReaderMode);
    }

    updateTabPinState(row: HTMLElement, isPinned: boolean) {
        this.updateOnOffIndicator(row, 'pinIndicator', isPinned);

        if (isPinned) {
            this.hidePinButton(row);
            this.showUnpinButton(row);
        } else {
            this.showPinButton(row);
            this.hideUnpinButton(row);
        }
    }

    updateTabIncognitoState(row: HTMLElement, isIncognito: boolean) {
        this.updateOnOffIndicator(row, 'incognitoIndicator', isIncognito);
    }

    private isTaskHandlingNotReady() {
        return !this.isInitialized || this.pendingTasks.length;
    }

    addPendingTask(task: () => void) {
        if (this.isTaskHandlingNotReady()) {
            this.pendingTasks.push(task);
            return;
        }

        task();
    }

    async playPendingTasks() {
        while (this.pendingTasks.length) {
            const callback = this.pendingTasks.pop();
            await callback();
        }

        this.pendingTasks = [];
    }

    filterTabs(filterTerms: string[]) {
        this.filterTerms = filterTerms;
        this.applyTabFilter();
    }

    applyTabFilter() {
        if (!this.isInitialized || !this.hasFilterTerms()) {
            return;
        }

        const rowList = Array.from(this.tbodyElement.querySelectorAll('tr'));

        for (const row of rowList) {
            if (row.classList.contains('noTabRow')) {
                continue;
            }

            const titleCell = row.querySelector('.title a');
            const title = titleCell.textContent.toLowerCase().trim();
            const url = titleCell.getAttribute('data-url').toLowerCase().trim();

            if (this.stringMatcher.isCaseSensitiveMatch(this.filterTerms, [title, url])) {
                row.classList.remove('filtered');
            } else {
                row.classList.add('filtered');
            }
        }

        this.showNoTabRowIfTableIsEmpty();
    }

    private hasFilterTerms() {
        return null !== this.filterTerms && this.filterTerms.length > 0;
    }
}
