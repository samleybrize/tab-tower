import { By, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';

export class SettingsSupport {
    constructor(private webdriverRetriever: WebDriverRetriever) {
    }

    getCloseTabOnMiddleClickElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('#close-tab-on-middle-click'));
    }

    getShowTabCloseButtonOnHoverElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('#show-tab-close-button-on-hover'));
    }

    getShowTabTitleOnSeveralLinesElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('#show-tab-title-on-several-lines'));
    }

    getShowTabUrlOnSeveralLinesElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('#show-tab-url-on-several-lines'));
    }

    getShowTabUrlElement(): WebElement {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.findElement(By.css('#show-url'));
    }
}
