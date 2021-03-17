import { By, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';

export class TabTagListSupport {
    constructor(private webdriverRetriever: WebDriverRetriever, private waitTimeout: number) {
    }

    async getTagAtPosition(containerElement: WebElement, tagPosition: number, condition: 'visible'|'filtered') {
        let includeTagSelector = '';

        if ('filtered' == condition) {
            includeTagSelector = '.hide';
        } else {
            includeTagSelector = ':not(.hide)';
        }

        const webdriver = this.webdriverRetriever.getDriver();
        let tag: WebElement;
        await webdriver.wait(async () => {
            const tagList = await containerElement.findElements(By.css(`.tab-tag${includeTagSelector}`));
            tag = tagList[tagPosition];

            return !!tag;
        }, this.waitTimeout, `Tag at position ${tagPosition} on the tab tag assignment view does not exists`);

        return tag;
    }

    getNoTagMatchesTagSearchElement(containerElement: WebElement): WebElement {
        return containerElement.findElement(By.css('.no-tag-matches-search'));
    }

    getAddTagButtonElement(containerElement: WebElement): WebElement {
        return containerElement.findElement(By.css('.new-tag-button'));
    }

    getFilterInputElement(containerElement: WebElement): WebElement {
        return containerElement.findElement(By.css('.filter input'));
    }

    getAllTagElements(containerElement: WebElement) {
        return containerElement.findElements(By.css('.tab-tag'));
    }

    getTagLabelElement(tag: WebElement): WebElement {
        return tag.findElement(By.css('.label'));
    }

    async getTagLabel(tag: WebElement): Promise<string> {
        const labelElement = await this.getTagLabelElement(tag);

        return labelElement.getText();
    }

    async getTagColorId(tag: WebElement): Promise<number> {
        return +await tag.getAttribute('data-color');
    }
}
