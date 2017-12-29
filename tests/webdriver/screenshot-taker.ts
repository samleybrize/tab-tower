import { readdirSync, unlinkSync, writeFileSync } from 'fs';
import * as path from 'path';
import { WebElement } from 'selenium-webdriver';

export class ScreenshotTaker {
    private static instance: ScreenshotTaker = null;

    private isInitDone = false;
    private screenshotDirectory = path.join(__dirname, '../../../..', 'tests/screenshots');

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    private init() {
        if (this.isInitDone) {
            return;
        }

        this.purge();
        this.isInitDone = true;
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

    async take(identifier: string, element: WebElement) {
        this.init();

        const screenshotData = await element.takeScreenshot(true);
        const screenshotFilePath = path.join(this.screenshotDirectory, `${identifier}.png`);
        writeFileSync(screenshotFilePath, screenshotData, 'base64');
    }
}
