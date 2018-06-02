export type TabAddressTypes = 'url'|'domain'|'none';

export interface TabSettings {
    showTitleOnSeveralLines: boolean;
    showUrlOnSeveralLines: boolean;
    addressToShow: TabAddressTypes;
    showCloseButtonOnHover: boolean;
    closeTabOnMiddleClick: boolean;
}

export class Settings {
    tabs: TabSettings = {
        showTitleOnSeveralLines: false,
        showUrlOnSeveralLines: false,
        addressToShow: 'domain',
        showCloseButtonOnHover: true,
        closeTabOnMiddleClick: true,
    };
}
