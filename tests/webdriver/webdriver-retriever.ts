import { Builder } from 'selenium-webdriver';

import { FirefoxConfig } from './firefox-config';

export class WebDriverRetriever {
    private static instance: WebDriverRetriever;
    private firefoxConfig: FirefoxConfig;

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    constructor() {
        this.firefoxConfig = new FirefoxConfig();
    }

    getDriver() {
        const firefoxOptions = this.firefoxConfig.getWebdriverOptions();

        const driver = new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(firefoxOptions)
            .build()
        ;

        return driver;
    }

    getFirefoxConfig() {
        return this.firefoxConfig;
    }
}
