import { By, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';

export enum SelectedTabsContextMenuButtons {
    MANAGE_TAGS = 'manage-tags-button',
    RELOAD = 'reload-button',
    MUTE = 'mute-button',
    UNMUTE = 'unmute-button',
    PIN = 'pin-button',
    UNPIN = 'unpin-button',
    DUPLICATE = 'duplicate-button',
    DISCARD = 'discard-button',
    MOVE = 'move-button',
    CLOSE = 'close-button',
}

export class TabsViewSupport {
    constructor(private webdriverRetriever: WebDriverRetriever) {
    }

    getCurrentTabListElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .current-tab-list'));
    }

    async getCurrentTabListLabel(): Promise<string> {
        const currentTabListElement = this.getCurrentTabListElement();

        return await currentTabListElement.findElement(By.css('.name')).getText();
    }

    async getCurrentTabListNumberOfTabs(): Promise<number> {
        const currentTabListElement = this.getCurrentTabListElement();

        return +await currentTabListElement.findElement(By.css('.number-of-tabs')).getText();
    }

    getGoToSidenavButtonElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .sidenav-button'));
    }

    getTabFilterInputElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .filter input.filter-input'));
    }

    getTabFilterClearInputElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .filter .clear-icon'));
    }

    getNewTabButtonElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .new-tab-button'));
    }

    getMoveBelowAllButtonElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .move-below-all-button'));
    }

    getCancelTabMoveButtonElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .cancel-tab-move-button'));
    }

    getCancelTabMoveButtonClickableElement(): WebElement {
        return this.getCancelTabMoveButtonElement().findElement(By.css('i'));
    }

    getSelectedTabsContextMenuElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .context-menu'));
    }

    getSelectedTabsContextMenuButtonElement(button: SelectedTabsContextMenuButtons): WebElement {
        const contextMenuElement = this.getSelectedTabsContextMenuElement();

        return contextMenuElement.findElement(By.css(`.${button}`));
    }

    getSelectedTabsActionsButtonElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .selected-tabs-actions-button i'));
    }

    async isGeneralTabSelectorChecked(): Promise<boolean> {
        const generalSelectorElement = this.getGeneralTabSelectorContainerElement();
        const checkboxElement = this.getGeneralTabSelectorInputElement(generalSelectorElement);
        const checkedIconElement = this.getGeneralTabSelectorCheckedElement(generalSelectorElement);
        const uncheckedIconElement = this.getGeneralTabSelectorUncheckedElement(generalSelectorElement);

        return await checkedIconElement.isDisplayed() && !await uncheckedIconElement.isDisplayed() && await checkboxElement.isSelected();
    }

    async isGeneralTabSelectorUnchecked(): Promise<boolean> {
        const generalSelectorElement = this.getGeneralTabSelectorContainerElement();
        const checkboxElement = this.getGeneralTabSelectorInputElement(generalSelectorElement);
        const checkedIconElement = this.getGeneralTabSelectorCheckedElement(generalSelectorElement);
        const uncheckedIconElement = this.getGeneralTabSelectorUncheckedElement(generalSelectorElement);

        return !await checkedIconElement.isDisplayed() && await uncheckedIconElement.isDisplayed() && !await checkboxElement.isSelected();
    }

    private getGeneralTabSelectorContainerElement() {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-list .general-tab-selector'));
    }

    private getGeneralTabSelectorInputElement(generalTabSelectorContainerElement: WebElement) {
        return generalTabSelectorContainerElement.findElement(By.css('input'));
    }

    private getGeneralTabSelectorCheckedElement(generalTabSelectorContainerElement: WebElement) {
        return generalTabSelectorContainerElement.findElement(By.css('.checked'));
    }

    private getGeneralTabSelectorUncheckedElement(generalTabSelectorContainerElement: WebElement) {
        return generalTabSelectorContainerElement.findElement(By.css('.unchecked'));
    }

    getGeneralTabSelectorClickableElement(): WebElement {
        const generalTabSelectorContainerElement = this.getGeneralTabSelectorContainerElement();

        return generalTabSelectorContainerElement.findElement(By.css('.checkbox-icon'));
    }
}
