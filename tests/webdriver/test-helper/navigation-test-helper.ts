import { assert } from 'chai';
import { By, WebDriver } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { ScreenshotTaker } from '../screenshot-taker';

export class NavigationTestHelper {
    constructor(private driver: WebDriver, private screenshotTaker: ScreenshotTaker) {
    }

    async getOpenedTabsListElement() {
        return this.driver.findElement(By.css('#openedTabList'));
    }

    async getFollowedTabsListElement() {
        return this.driver.findElement(By.css('#followedTabList'));
    }

    async getOpenedTabsCounterElement() {
        return this.driver.findElement(By.css('#header .openedTabs .counter'));
    }

    async getFollowedTabsCounterElement() {
        return this.driver.findElement(By.css('#header .followedTabs .counter'));
    }

    async clickOnOpenedTabsButton() {
        const openedTabsListElement = await this.getOpenedTabsListElement();

        await this.driver.findElement(By.css('#header .openedTabs')).click();
        await this.driver.wait(async () => {
            return await openedTabsListElement.isDisplayed();
        });
        await sleep(500);
    }

    async clickOnFollowedTabsButton() {
        const followedTabsListElement = await this.getFollowedTabsListElement();

        await this.driver.findElement(By.css('#header .followedTabs')).click();
        await this.driver.wait(async () => {
            return await followedTabsListElement.isDisplayed();
        });
        await sleep(500);
    }

    async clickOnNewTabButton() {
        const openedTabsCounterElement = await this.getOpenedTabsCounterElement();
        const counterBefore = +await openedTabsCounterElement.getText();

        await this.driver.findElement(By.css('#header .newTab')).click();
        await this.driver.wait(async () => {
            const actualCounter = +await openedTabsCounterElement.getText();

            return actualCounter > counterBefore;
        });
    }

    async changeShownNumberOfOpenedTabs(newNumber: number) {
        await this.driver.executeScript(`
            const element = document.querySelector('#header .openedTabs .counter');

            if (element) {
                element.innerText = '${newNumber}';
            }
        `);
    }

    async changeShownNumberOfFollowedTabs(newNumber: number) {
        await this.driver.executeScript(`
            const element = document.querySelector('#header .followedTabs .counter');

            if (element) {
                element.innerText = '${newNumber}';
            }
        `);
    }

    async takeHeaderScreenshot(screenshotIdentifier: string) {
        const headerElement = this.driver.findElement(By.css('#header'));
        await this.screenshotTaker.takeElement(screenshotIdentifier, headerElement);
    }

    async assertBreadcrumbText(expectedText: string) {
        const breadcrumbElement = this.driver.findElement(By.css('#header .title span'));
        assert.equal(await breadcrumbElement.getText(), expectedText);
    }

    async assertOpenedTabsListIsVisible() {
        const openedTabsListElement = await this.getOpenedTabsListElement();
        assert.isTrue(await openedTabsListElement.isDisplayed(), 'Opened tab list is not visible');
    }

    async assertOpenedTabsListIsNotVisible() {
        const openedTabsListElement = await this.getOpenedTabsListElement();
        assert.isFalse(await openedTabsListElement.isDisplayed(), 'Opened tab list is visible');
    }

    async assertOpenedTabsCounter(expectedNumber: number) {
        const openedTabsCounter = await  this.getOpenedTabsCounterElement();
        assert.equal(await openedTabsCounter.getText(), '' + expectedNumber);
    }

    async assertFollowedTabsListIsVisible() {
        const followedTabsListElement = await this.getFollowedTabsListElement();
        assert.isTrue(await followedTabsListElement.isDisplayed(), 'Followed tab list is not visible');
    }

    async assertFollowedTabsListIsNotVisible() {
        const followedTabsListElement = await this.getFollowedTabsListElement();
        assert.isFalse(await followedTabsListElement.isDisplayed(), 'Followed tab list is visible');
    }

    async assertFollowedTabsCounter(expectedNumber: number) {
        const followedTabsCounter = await this.getFollowedTabsCounterElement();
        assert.equal(await followedTabsCounter.getText(), '' + expectedNumber);
    }
}
