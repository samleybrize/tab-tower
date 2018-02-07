import { By, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { BrowserInstructionSender } from '../../utils/browser-instruction-sender';
import { ScreenshotTaker } from '../screenshot-taker';

export class TabFilterTestHelper {
    constructor(private driver: WebDriver, private browserInstructionSender: BrowserInstructionSender, private screenshotTaker: ScreenshotTaker) {
    }

    async getInputElement() {
        return this.driver.findElement(By.css('#headerTabFilter input'));
    }

    async clearInput() {
        const inputElement = await this.getInputElement();
        await inputElement.clear();
        await sleep(500);
    }

    async sendTextToInput(textToSend: string) {
        const inputElement = await this.getInputElement();
        await inputElement.sendKeys(textToSend);
        await sleep(500);
    }

    async clickOnResetButton() {
        await this.driver.findElement(By.css('#headerTabFilter .resetButton')).click();
        await sleep(500);
    }

    async focusInput() {
        await this.browserInstructionSender.focusElement(this.driver, '#headerTabFilter input');
        await sleep(500);
    }

    async blurInput() {
        await this.browserInstructionSender.blurElement(this.driver, '#headerTabFilter input');
        await sleep(500);
    }

    async takeHeaderScreenshot(screenshotIdentifier: string) {
        const headerElement = this.driver.findElement(By.css('#header'));
        await this.screenshotTaker.takeElement(screenshotIdentifier, headerElement);
    }
}
