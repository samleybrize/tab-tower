import { When } from 'cucumber';
import { By, Key, WebDriver, WebElement } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

When('I type {string} in the tab filter input', async function(filterText: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-list .filter input.filter-input'));
    await inputElement.sendKeys(filterText);
});

When('I delete all characters in the tab filter input', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const inputElement = webdriver.findElement(By.css('.tab-list .filter input.filter-input'));
    await inputElement.clear();
});

When('I click on the general tab selector', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const generalTabSelectorElement = webdriver.findElement(By.css('.tab-list .general-tab-selector .checkbox-icon'));

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

When('I click outside of the context menu', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const visibleContextMenuBoundingRect = await getVisibleContextMenuBoundingRect(webdriver);
    const tabSelector = await getTabSelectorNotHiddenByRect(webdriver, visibleContextMenuBoundingRect);

    await webdriver.actions().move({origin: tabSelector}).click().perform();
});

async function getVisibleContextMenuBoundingRect(webdriver: WebDriver) {
    const contextMenuList = await webdriver.findElements(By.css('.tab-list .context-menu'));
    let visibleContextMenu: WebElement = null;

    for (const contextMenu of contextMenuList) {
        if (!await contextMenu.isDisplayed()) {
            visibleContextMenu = contextMenu;

            break;
        }
    }

    if (null === visibleContextMenu) {
        throw new Error('No visible context menu found');
    }

    return webdriver.executeScript<Promise<ClientRect>>((element: HTMLElement) => {
        return element.getBoundingClientRect();
    }, visibleContextMenu);
}

async function getTabSelectorNotHiddenByRect(webdriver: WebDriver, rect: ClientRect) {
    const tabSelectorList = await webdriver.findElements(By.css('.tab-list .tab-selector'));

    for (const tabSelector of tabSelectorList) {
        const tabSelectorRect = await webdriver.executeScript<Promise<ClientRect>>((element: HTMLElement) => {
            return element.getBoundingClientRect();
        }, tabSelector);

        if (tabSelectorRect.top > rect.bottom || tabSelectorRect.bottom < rect.top || tabSelectorRect.right < rect.left || tabSelectorRect.left > rect.right) {
            return tabSelector;
        }
    }
}

When('I click on the selected tabs actions button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);
});

async function clickOnSelectedTabsActionsButton(webdriver: WebDriver) {
    const selectedTabsActionsButton = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-button i'));

    await selectedTabsActionsButton.click();
}

When('I click on the selected tabs actions reload button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .reload-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions reload button is not clickable');
});

When('I click on the selected tabs actions mute button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .mute-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions mute button is not clickable');
});

When('I click on the selected tabs actions unmute button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .unmute-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions unmute button is not clickable');
});

When('I click on the selected tabs actions pin button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .pin-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions pin button is not clickable');
});

When('I click on the selected tabs actions unpin button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .unpin-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions unpin button is not clickable');
});

When('I click on the selected tabs actions duplicate button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .duplicate-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions duplicate button is not clickable');
});

When('I click on the selected tabs actions discard button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .discard-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions discard button is not clickable');
});

When('I click on the selected tabs actions close button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .close-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions close button is not clickable');
});

When('I click on the selected tabs actions move button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    await clickOnSelectedTabsActionsButton(webdriver);

    const buttonElement = webdriver.findElement(By.css('.tab-list .selected-tabs-actions-context-menu-container .move-button'));
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'Selected tabs actions move button is not clickable');
});

When('I click on the move below all button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const buttonElement = webdriver.findElement(By.css('.tab-list .move-below-all-button'));

    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'The move tab below all button is not clickable');
});

When('I click on the cancel tab move button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const buttonElement = webdriver.findElement(By.css('.tab-list .cancel-tab-move-button i'));

    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, 'The cancel tab move button is not clickable');
});

When('I scroll the unpinned tabs list down', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const unpinnedTabsElement = webdriver.findElement(By.css('.unpinned-tabs'));

    await webdriver.actions().move({origin: unpinnedTabsElement}).click().sendKeys(Key.ARROW_DOWN, Key.ARROW_DOWN, Key.ARROW_DOWN, Key.ARROW_DOWN).perform();
});
