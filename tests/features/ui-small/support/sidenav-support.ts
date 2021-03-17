import { By, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';
import { BrowserSupport } from './browser-support';
import { TabTagListSupport } from './tab-tag-list-support';

export enum TagContextMenuButtons {
    EDIT = 'edit-button',
    DELETE = 'delete-button',
}

export class SidenavSupport {
    constructor(private webdriverRetriever: WebDriverRetriever, private browserSupport: BrowserSupport, private tabTagListSupport: TabTagListSupport) {
    }

    getViewElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.sidenav'));
    }

    getHeaderElement(): WebElement {
        return this.getViewElement().findElement(By.css('.header'));
    }

    getCloseButtonElement(): WebElement {
        return this.getViewElement().findElement(By.css('.close-sidenav-button'));
    }

    getAllOpenedTabsButtonElement() {
        return this.getViewElement().findElement(By.css('.all-opened-tabs'));
    }

    getSettingsButtonElement() {
        return this.getViewElement().findElement(By.css('.settings'));
    }

    isButtonMarkedAsActive(buttonElement: WebElement): Promise<boolean> {
        return this.browserSupport.hasCssClass(buttonElement, 'active');
    }

    getNoTagMatchesTagSearchElement(): WebElement {
        return this.tabTagListSupport.getNoTagMatchesTagSearchElement(this.getTagListContainerElement());
    }

    getAddTagButtonElement(): WebElement {
        return this.tabTagListSupport.getAddTagButtonElement(this.getTagListContainerElement());
    }

    getTagFilterInputElement(): WebElement {
        return this.tabTagListSupport.getFilterInputElement(this.getTagListContainerElement());
    }

    getAllTagElements() {
        return this.tabTagListSupport.getAllTagElements(this.getTagListContainerElement());
    }

    async getTagAtPosition(tagPosition: number, condition: 'visible'|'filtered') {
        return this.tabTagListSupport.getTagAtPosition(this.getTagListContainerElement(), tagPosition, condition);
    }

    getTagLabelElement(tag: WebElement): WebElement {
        return this.tabTagListSupport.getTagLabelElement(tag);
    }

    async getTagLabel(tag: WebElement): Promise<string> {
        return this.tabTagListSupport.getTagLabel(tag);
    }

    async getTagColorId(tag: WebElement): Promise<number> {
        return this.tabTagListSupport.getTagColorId(tag);
    }

    getTagContextMenuElement(tag: WebElement): WebElement {
        return tag.findElement(By.css('.context-menu'));
    }

    getTabContextMenuButtonElement(tag: WebElement, button: TagContextMenuButtons): WebElement {
        const contextMenuElement = this.getTagContextMenuElement(tag);

        return contextMenuElement.findElement(By.css(`.${button}`));
    }

    getTagDeleteConfirmationBoxElement(tag: WebElement): WebElement {
        return tag.findElement(By.css('.delete-confirmation'));
    }

    getTagDeleteConfirmationYesButtonElement(tag: WebElement): WebElement {
        return this.getTagDeleteConfirmationBoxElement(tag).findElement(By.css('.yes'));
    }

    getTagDeleteConfirmationNoButtonElement(tag: WebElement): WebElement {
        return this.getTagDeleteConfirmationBoxElement(tag).findElement(By.css('.no'));
    }

    private getTagListContainerElement() {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-tag-list'));
    }
}
