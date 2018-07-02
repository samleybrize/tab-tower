import { Builder, WebDriver } from 'selenium-webdriver';

import { BrowserInstructionSender } from '../utils/browser-instruction-sender';
import { FirefoxConfig } from './firefox-config';
import { WebdriverHelper } from './webdriver-helper';

export class WebDriverRetriever {
    private static instance: WebDriverRetriever;
    private firefoxConfig: FirefoxConfig;
    private browserInstructionSender: BrowserInstructionSender;
    private webdriverHelper: WebdriverHelper = null;
    private webdriver: WebDriver = null;

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    constructor() {
        this.firefoxConfig = new FirefoxConfig();

        this.browserInstructionSender = new BrowserInstructionSender();
        this.browserInstructionSender.init();
    }

    isDriverCreated() {
        return null !== this.webdriver;
    }

    getDriver() {
        if (null === this.webdriver) {
            const firefoxOptions = this.firefoxConfig.getWebdriverOptions();

            this.webdriver = new Builder()
                .forBrowser('firefox')
                .setFirefoxOptions(firefoxOptions)
                .build()
            ;
        }

        return this.webdriver;
    }

    getWebdriverHelper() {
        if (null === this.webdriverHelper) {
            const webdriver = this.getDriver();
            this.webdriverHelper = new WebdriverHelper(webdriver, this.browserInstructionSender);
        }

        return this.webdriverHelper;
    }

    getFirefoxConfig() {
        return this.firefoxConfig;
    }

    getBrowserInstructionSender() {
        return this.browserInstructionSender;
    }
}
