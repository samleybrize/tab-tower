import { CommandBus } from '../../bus/command-bus';
import { QueryBus } from '../../bus/query-bus';
import { ConfigureCloseTabOnMiddleClick } from '../../settings/command/configure-close-tab-on-middle-click';
import { ConfigureShowCloseButtonOnTabHover } from '../../settings/command/configure-show-close-button-on-tab-hover';
import { ConfigureShowTabTitleOnSeveralLines } from '../../settings/command/configure-show-tab-title-on-several-lines';
import { ConfigureShowTabUrlOnSeveralLines } from '../../settings/command/configure-show-tab-url-on-several-lines';
import { ConfigureTabAddressToShow } from '../../settings/command/configure-tab-address-to-show';
import { CloseTabOnMiddleClickConfigured } from '../../settings/event/close-tab-on-middle-click-configured';
import { ShowCloseButtonOnTabHoverConfigured } from '../../settings/event/show-close-button-on-tab-hover-configured';
import { ShowTabTitleOnSeveralLinesConfigured } from '../../settings/event/show-tab-title-on-several-lines-configured';
import { ShowTabUrlOnSeveralLinesConfigured } from '../../settings/event/show-tab-url-on-several-lines-configured';
import { TabAddressToShowConfigured } from '../../settings/event/tab-address-to-show-configured';
import { GetSettings } from '../../settings/query/get-settings';
import { TabAddressTypes } from '../../settings/settings';

export class SettingsView {
    private closeTabOnMiddleClickCheckbox: HTMLInputElement;
    private showCloseButtonOnTabHoverCheckbox: HTMLInputElement;
    private showTabTitleOnSeveralLinesCheckbox: HTMLInputElement;
    private showTabUrlOnSeveralLinesCheckbox: HTMLInputElement;
    private tabAddressToShowSelect: HTMLSelectElement;

    constructor(private commandBus: CommandBus, private queryBus: QueryBus) {
        const containerElement = document.querySelector('.ui-settings');
        this.closeTabOnMiddleClickCheckbox = containerElement.querySelector('#close-tab-on-middle-click');
        this.showCloseButtonOnTabHoverCheckbox = containerElement.querySelector('#show-tab-close-button-on-hover');
        this.showTabTitleOnSeveralLinesCheckbox = containerElement.querySelector('#show-tab-title-on-several-lines');
        this.showTabUrlOnSeveralLinesCheckbox = containerElement.querySelector('#show-tab-url-on-several-lines');
        this.tabAddressToShowSelect = containerElement.querySelector('#show-url');

        this.closeTabOnMiddleClickCheckbox.addEventListener('change', this.onCloseTabOnMiddleClickChange.bind(this));
        this.showCloseButtonOnTabHoverCheckbox.addEventListener('change', this.onShowCloseButtonOnTabHoverChange.bind(this));
        this.showTabTitleOnSeveralLinesCheckbox.addEventListener('change', this.onShowTabTitleOnSeveralLinesChange.bind(this));
        this.showTabUrlOnSeveralLinesCheckbox.addEventListener('change', this.onShowTabUrlOnSeveralLinesChange.bind(this));
        this.tabAddressToShowSelect.addEventListener('change', this.onTabAddressToShowChange.bind(this));
    }

    async init() {
        const settings = await this.queryBus.query(new GetSettings());

        this.updateChexkboxStatus(this.closeTabOnMiddleClickCheckbox, settings.tabs.closeTabOnMiddleClick);
        this.updateChexkboxStatus(this.showCloseButtonOnTabHoverCheckbox, settings.tabs.showCloseButtonOnHover);
        this.updateChexkboxStatus(this.showTabTitleOnSeveralLinesCheckbox, settings.tabs.showTitleOnSeveralLines);
        this.updateChexkboxStatus(this.showTabUrlOnSeveralLinesCheckbox, settings.tabs.showUrlOnSeveralLines);
        this.updateSelectorStatus(this.tabAddressToShowSelect, settings.tabs.addressToShow);
    }

    private updateChexkboxStatus(checkboxElement: HTMLInputElement, checkStatus: boolean) {
        if (checkStatus) {
            checkboxElement.setAttribute('checked', 'checked');
            checkboxElement.checked = true;
        } else {
            checkboxElement.removeAttribute('checked');
            checkboxElement.checked = false;
        }
    }

    private updateSelectorStatus(selectorElement: HTMLSelectElement, selectedValue: string) {
        selectorElement.value = selectedValue;
    }

    async onCloseTabOnMiddleClickConfigure(event: CloseTabOnMiddleClickConfigured) {
        this.updateChexkboxStatus(this.closeTabOnMiddleClickCheckbox, event.closeTabOnMiddleClick);
    }

    async onShowCloseButtonOnTabHoverConfigure(event: ShowCloseButtonOnTabHoverConfigured) {
        this.updateChexkboxStatus(this.showCloseButtonOnTabHoverCheckbox, event.showCloseButton);
    }

    async onShowTabTitleOnSeveralLinesConfigure(event: ShowTabTitleOnSeveralLinesConfigured) {
        this.updateChexkboxStatus(this.showTabTitleOnSeveralLinesCheckbox, event.showTabTitleOnSeveralLines);
    }

    async onShowTabUrlOnSeveralLinesConfigure(event: ShowTabUrlOnSeveralLinesConfigured) {
        this.updateChexkboxStatus(this.showTabUrlOnSeveralLinesCheckbox, event.showTabUrlOnSeveralLines);
    }

    async onTabAddressToShowConfigure(event: TabAddressToShowConfigured) {
        this.updateSelectorStatus(this.tabAddressToShowSelect, event.tabAddressToShow);
    }

    async onCloseTabOnMiddleClickChange() {
        this.commandBus.handle(new ConfigureCloseTabOnMiddleClick(this.closeTabOnMiddleClickCheckbox.checked));
    }

    async onShowCloseButtonOnTabHoverChange() {
        this.commandBus.handle(new ConfigureShowCloseButtonOnTabHover(this.showCloseButtonOnTabHoverCheckbox.checked));
    }

    async onShowTabTitleOnSeveralLinesChange() {
        this.commandBus.handle(new ConfigureShowTabTitleOnSeveralLines(this.showTabTitleOnSeveralLinesCheckbox.checked));
    }

    async onShowTabUrlOnSeveralLinesChange() {
        this.commandBus.handle(new ConfigureShowTabUrlOnSeveralLines(this.showTabUrlOnSeveralLinesCheckbox.checked));
    }

    async onTabAddressToShowChange() {
        this.commandBus.handle(new ConfigureTabAddressToShow(this.tabAddressToShowSelect.value as TabAddressTypes));
    }
}
