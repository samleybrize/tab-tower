import { By, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';
import { TabTagListSupport } from './tab-tag-list-support';

export class TabTagAssignmentSupport {
    constructor(private webdriverRetriever: WebDriverRetriever, private tabTagListSupport: TabTagListSupport) {
    }

    getViewElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-tag-assign'));
    }

    getCancelButtonElement(): WebElement {
        return this.getViewElement().findElement(By.css('.cancel-button'));
    }

    getNoTagMatchesTagSearchElement(): WebElement {
        return this.tabTagListSupport.getNoTagMatchesTagSearchElement(this.getViewElement());
    }

    getAddTagButtonElement(): WebElement {
        return this.tabTagListSupport.getAddTagButtonElement(this.getViewElement());
    }

    getFilterInputElement(): WebElement {
        return this.tabTagListSupport.getFilterInputElement(this.getViewElement());
    }

    getAllTagElements() {
        return this.tabTagListSupport.getAllTagElements(this.getViewElement());
    }

    async getTagAtPosition(tagPosition: number, condition: 'visible'|'filtered') {
        return this.tabTagListSupport.getTagAtPosition(this.getViewElement(), tagPosition, condition);
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

    async isTagChecked(tag: WebElement): Promise<boolean> {
        const checkboxContainer = this.getTagCheckboxElement(tag);
        const checkedElement = this.getCheckedElement(checkboxContainer);
        const uncheckedElement = this.getUncheckedElement(checkboxContainer);
        const indeterminateElement = this.getIndeterminateElement(checkboxContainer);

        return await checkedElement.isDisplayed() && !await uncheckedElement.isDisplayed() && !await indeterminateElement.isDisplayed();
    }

    async isTagUnchecked(tag: WebElement): Promise<boolean> {
        const checkboxContainer = this.getTagCheckboxElement(tag);
        const checkedElement = this.getCheckedElement(checkboxContainer);
        const uncheckedElement = this.getUncheckedElement(checkboxContainer);
        const indeterminateElement = this.getIndeterminateElement(checkboxContainer);

        return !await checkedElement.isDisplayed() && await uncheckedElement.isDisplayed() && !await indeterminateElement.isDisplayed();
    }

    async isTagCheckStateIsIndeterminate(tag: WebElement): Promise<boolean> {
        const checkboxContainer = this.getTagCheckboxElement(tag);
        const checkedElement = this.getCheckedElement(checkboxContainer);
        const uncheckedElement = this.getUncheckedElement(checkboxContainer);
        const indeterminateElement = this.getIndeterminateElement(checkboxContainer);

        return !await checkedElement.isDisplayed() && !await uncheckedElement.isDisplayed() && await indeterminateElement.isDisplayed();
    }

    getTagCheckboxElement(tag: WebElement): WebElement {
        return tag.findElement(By.css('.checkbox'));
    }

    // TODO to move
    private getCheckedElement(checkboxContainer: WebElement) {
        return checkboxContainer.findElement(By.css('.checked-icon'));
    }

    // TODO to move
    private getUncheckedElement(checkboxContainer: WebElement) {
        return checkboxContainer.findElement(By.css('.unchecked-icon'));
    }

    // TODO to move
    private getIndeterminateElement(checkboxContainer: WebElement) {
        return checkboxContainer.findElement(By.css('.indeterminate-icon'));
    }

    // TODO to move
    async getTagClickableCheckboxElement(tag: WebElement) {
        const checkboxContainer = this.getTagCheckboxElement(tag);
        const checkboxState = await checkboxContainer.getAttribute('state');

        if ('checked' == checkboxState) {
            return checkboxContainer.findElement(By.css('.checked-icon'));
        } else if ('unchecked' == checkboxState) {
            return checkboxContainer.findElement(By.css('.unchecked-icon'));
        } else {
            return checkboxContainer.findElement(By.css('.indeterminate-icon'));
        }
    }
}
