import { assert } from 'chai';
import { By, error as WebDriverError, WebDriver, WebElement } from 'selenium-webdriver';

import { sleep } from '../../../src/typescript/utils/sleep';
import { TabsTestHelper } from './tabs-test-helper';

export class BrowserActionTestHelper {
    constructor(private driver: WebDriver) {
    }

    async clickOnFollowButton() {
        const followButton = this.driver.findElement(By.css('.currentTabNotFollowed button'));

        await followButton.click();
        await sleep(500);
    }

    async clickOnUnfollowButton() {
        const unfollowButton = this.driver.findElement(By.css('.currentTabFollowed button'));

        await unfollowButton.click();
        await sleep(500);
    }

    async clickOnGoToControlCenterButton() {
        const goToControlCenterButton = this.driver.findElement(By.css('.goToControlCenter'));

        await goToControlCenterButton.click();
        await sleep(500);
    }

    async waitViewIsInitialized() {
        await sleep(200);
        await this.driver.wait(async () => {
            const isNotFollowedContainerVisible = await this.driver.findElement(By.css('.currentTabNotFollowed')).isDisplayed();
            const isFollowedContainerVisible = await this.driver.findElement(By.css('.currentTabFollowed')).isDisplayed();

            return isFollowedContainerVisible || isNotFollowedContainerVisible;
        }, 3000);
    }

    async assertFollowIndicatorIsVisible() {
        const followIndicator = this.driver.findElement(By.css('.currentTabFollowed .followIndicator'));

        assert.isTrue(await followIndicator.isDisplayed());
    }

    async assertFollowIndicatorIsNotVisible() {
        const followIndicator = this.driver.findElement(By.css('.currentTabFollowed .followIndicator'));

        assert.isFalse(await followIndicator.isDisplayed());
    }

    async assertFollowButtonIsVisible() {
        const followButton = this.driver.findElement(By.css('.currentTabNotFollowed button'));

        assert.isTrue(await followButton.isDisplayed());
    }

    async assertFollowButtonIsNotVisible() {
        const followButton = this.driver.findElement(By.css('.currentTabNotFollowed button'));

        assert.isFalse(await followButton.isDisplayed());
    }

    async assertUnfollowIndicatorIsVisible() {
        const unfollowIndicator = this.driver.findElement(By.css('.currentTabNotFollowed .followIndicator'));

        assert.isTrue(await unfollowIndicator.isDisplayed());
    }

    async assertUnfollowIndicatorIsNotVisible() {
        const unfollowIndicator = this.driver.findElement(By.css('.currentTabNotFollowed .followIndicator'));

        assert.isFalse(await unfollowIndicator.isDisplayed());
    }

    async assertUnfollowButtonIsVisible() {
        const unfollowButton = this.driver.findElement(By.css('.currentTabFollowed button'));

        assert.isTrue(await unfollowButton.isDisplayed());
    }

    async assertUnfollowButtonIsNotVisible() {
        const unfollowButton = this.driver.findElement(By.css('.currentTabFollowed button'));

        assert.isFalse(await unfollowButton.isDisplayed());
    }
}
