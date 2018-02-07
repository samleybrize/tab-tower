import { readdirSync, unlinkSync, writeFileSync } from 'fs';
import * as path from 'path';
import { WebDriver, WebElement } from 'selenium-webdriver';

export class ScreenshotTaker {
    private static instance: ScreenshotTaker = null;

    private screenshotDirectory = path.join(__dirname, '../../../..', 'tests/screenshots');

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    constructor() {
        this.purge();
    }

    private purge() {
        const oldScreenshotFileList = readdirSync(this.screenshotDirectory);

        for (const filepath of oldScreenshotFileList) {
            if ('.png' !== filepath.substr(-4)) {
                continue;
            }

            unlinkSync(path.join(this.screenshotDirectory, filepath));
        }
    }

    async takeElement(identifier: string, element: WebElement) {
        const screenshotData = await element.takeScreenshot(true);
        const screenshotFilePath = path.join(this.screenshotDirectory, `${identifier}.png`);
        writeFileSync(screenshotFilePath, screenshotData, 'base64');
    }

    async takeViewport(identifier: string, driver: WebDriver) {
        const screenshotData = await driver.takeScreenshot();
        const screenshotFilePath = path.join(this.screenshotDirectory, `${identifier}.png`);
        writeFileSync(screenshotFilePath, screenshotData, 'base64');
    }
}
