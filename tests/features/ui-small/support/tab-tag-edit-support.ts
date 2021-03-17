import { By, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';
import { BrowserSupport } from './browser-support';

export class TabTagEditSupport {
    constructor(private webdriverRetriever: WebDriverRetriever, private browserSupport: BrowserSupport) {
    }

    getViewElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('.tab-tag-edit'));
    }

    async getViewTitle(): Promise<string> {
        const titleElement = this.getViewElement().findElement(By.css('.title'));

        return await titleElement.getText();
    }

    getCancelButtonElement(): WebElement {
        return this.getViewElement().findElement(By.css('.cancel-button'));
    }

    getLabelInputElement() {
        return this.getViewElement().findElement(By.css('.label input'));
    }

    async getLabelInputValue(): Promise<string> {
        const inputElement = this.getLabelInputElement();

        return await inputElement.getAttribute('value');
    }

    isLabelInputMarkedAsInvalid() {
        const inputElement = this.getLabelInputElement();

        return this.browserSupport.hasCssClass(inputElement, 'invalid');
    }

    getColorButtonElement(colorId: number) {
        return this.getViewElement().findElement(By.css(`.color-selector label.color-${colorId}`));
    }

    getSubmitButtonElement() {
        return this.getViewElement().findElement(By.css('.submit'));
    }
}
