import { When } from 'cucumber';
import { By } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

When('I click on the general tab selector', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const generalTabSelectorElement = webdriver.findElement(By.css('.tab-list .general-tab-selector'));

    await TabSupport.clickElementOnceAvailable(
        webdriver,
        generalTabSelectorElement,
        'General tab selector is not clickable',
    );
});

When('I click on the new tab button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const newTabButtonElement = webdriver.findElement(By.css('.tab-list .new-tab-button'));

    await newTabButtonElement.click();
});
